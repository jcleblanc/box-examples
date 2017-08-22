using System;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Box.V2;
using Box.V2.Config;
using Box.V2.JWTAuth;
using Box.V2.Models;

namespace net_web.Controllers
{
    [Route("route/")]
    public class ValuesController : Controller
    {
        public static IConfigurationRoot Configuration { get; set; }

        public static Tuple<BoxConfig, BoxClient> BuildConfig()
        {
            // Set up configuration detail accessor
            var builder = new ConfigurationBuilder()
              .SetBasePath(Directory.GetCurrentDirectory())
              .AddJsonFile("appsettings.json");

            Configuration = builder.Build();

            // modify the app.config file to reflect your Box app config values
            var clientID = Configuration["Config:ClientID"];
            var clientSecret = Configuration["Config:ClientSecret"];
            var redirectURL = Configuration["Config:RedirectURI"];

            BoxConfig config = new BoxConfig(clientID, clientSecret, new Uri(redirectURL));
            BoxClient client = new BoxClient(config);

            return Tuple.Create(config, client);
        }

        // GET route/start
        [HttpGet]
        [Route("start")]
        public RedirectResult Get()
        {
            var config = BuildConfig().Item1;

            return Redirect(config.AuthCodeUri.ToString());
        }

        // GET route/return
        [HttpGet]
        [Route("return")]
        public async Task Get(int id)
        {
            var client = BuildConfig().Item2;

            var code = Request.Query["code"];
            await client.Auth.AuthenticateAsync(code);

            BoxFile newFile;

            // Create request object with name and parent folder the file should be uploaded to
            using (FileStream stream = new FileStream("taxdoc.txt", FileMode.Open))
            {
                BoxFileRequest req = new BoxFileRequest()
                {
                    Name = "taxdoc.txt",
                    Parent = new BoxRequestEntity() { Id = "0" }
                };
                newFile = await client.FilesManager.UploadAsync(req, stream);
                Console.Out.Write(newFile.Id);
            }
        }
    }
}
