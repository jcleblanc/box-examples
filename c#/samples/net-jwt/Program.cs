using System;
using System.ComponentModel;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Box.V2.Config;
using Box.V2.JWTAuth;
using Box.V2.Models;

namespace net_jwt
{
    public class Program
    {
        public static IConfigurationRoot Configuration { get; set; }
        
        static void Main(string[] args)
        {
            // Set up configuration detail accessor
            var builder = new ConfigurationBuilder()
              .SetBasePath(Directory.GetCurrentDirectory())
              .AddJsonFile("appsettings.json");

            Configuration = builder.Build();

            Task t = MainAsync();
            t.Wait();

            Console.WriteLine();
            Console.Write("Press return to exit...");
            Console.ReadLine();
        }

        static async Task MainAsync()
        {
            string CLIENT_ID = Configuration["Config:ClientID"];
            string CLIENT_SECRET = Configuration["Config:ClientSecret"];
            string ENTERPRISE_ID = Configuration["Config:EnterpriseID"];
            string JWT_PRIVATE_KEY_PATH = Configuration["Config:PrivateKeyPath"];
            string JWT_PRIVATE_KEY_PASSWORD = Configuration["Config:PrivateKeyPass"];
            string JWT_PUBLIC_KEY_ID = Configuration["Config:PublicKeyID"];

            var privateKey = File.ReadAllText(JWT_PRIVATE_KEY_PATH);
            
            var boxConfig = new BoxConfig(CLIENT_ID, CLIENT_SECRET, ENTERPRISE_ID, privateKey, JWT_PRIVATE_KEY_PASSWORD, JWT_PUBLIC_KEY_ID);
            var boxJWT = new BoxJWTAuth(boxConfig);

            var adminToken = boxJWT.AdminToken();
            Console.WriteLine("Admin Token: " + adminToken);

            var adminClient = boxJWT.AdminClient(adminToken);

            var userRequest = new BoxUserRequest
            {
                Name = "John Smith",
                IsPlatformAccessOnly = true
            };
            var user = await adminClient.UsersManager.CreateEnterpriseUserAsync(userRequest);
            Console.Write("New app user created with Id = {0}", user.Id);

            /*BoxFile newFile;

            // Create request object with name and parent folder the file should be uploaded to
            using (FileStream stream = new FileStream(@"/Users/jleblanc/localhost/box/net-jwt/tax.txt", FileMode.Open))
            {
                BoxFileRequest req = new BoxFileRequest()
                {
                    Name = "tax.txt",
                    Parent = new BoxRequestEntity() { Id = "0" }
                };
                newFile = await adminClient.FilesManager.UploadAsync(req, stream);
            }*/
        }
    }
}
