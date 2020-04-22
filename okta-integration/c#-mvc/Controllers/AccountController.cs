using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Okta.AspNetCore;
using Box.V2;
using Box.V2.Config;
using Box.V2.JWTAuth;
using Box.V2.Models;

public class AccountController : Controller
{
    public IActionResult SignIn()
    {
        if (!HttpContext.User.Identity.IsAuthenticated)
        {
            return Challenge(OktaDefaults.MvcAuthenticationScheme);
        }

        return RedirectToAction("Profile", "Account");
    }

    [Authorize]
    [Route("~/profile")]
    public IActionResult Profile()
    {
        var subClaim = HttpContext.User.Claims.First(c => c.Type == "sub");
        var sub = subClaim.Value;

        var nameClaim = HttpContext.User.Claims.First(c => c.Type == "name");
        var name = nameClaim.Value;

        Task userSearch = validateUser(name, sub);

        Task.WaitAll(userSearch);

        return Content(name);
    }

    static async Task validateUser(string name, string sub)
    {
        // Configure Box SDK instance
        var reader = new StreamReader("config.json");
        var json = reader.ReadToEnd();
        var config = BoxConfig.CreateFromJsonString(json);
        var sdk = new BoxJWTAuth(config);
        var token = sdk.AdminToken();
        BoxClient client = sdk.AdminClient(token);

        // Search for matching Box app user for Okta ID
        BoxCollection<BoxUser> users = await client.UsersManager.GetEnterpriseUsersAsync(externalAppUserId:sub);
        System.Diagnostics.Debug.WriteLine(users.TotalCount);

        if (users.TotalCount > 0)
        {
            // Box user found, get token
            var userId = users.Entries[0].Id;
            var userToken = sdk.UserToken(userId);
            BoxClient userClient = sdk.UserClient(userToken, userId);

            // Get current user
            BoxUser currentUser = await userClient.UsersManager.GetCurrentUserInformationAsync();
            System.Diagnostics.Debug.WriteLine("Current user name: " + currentUser.Name);
        }
        else
        {
            // No associated user found, create app user
            var userRequest = new BoxUserRequest()
            {
                Name = name,
                ExternalAppUserId = sub,
                IsPlatformAccessOnly = true
            };
            var user = await client.UsersManager.CreateEnterpriseUserAsync(userRequest);
            System.Diagnostics.Debug.WriteLine("New user created: " + user.Name);
        }
    }
}