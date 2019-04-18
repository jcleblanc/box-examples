using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Box.V2.Config;
using Box.V2.Exceptions;
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
            //Console.WriteLine("Admin Token: " + adminToken);

            var client = boxJWT.AdminClient(adminToken);

            /* var userRequest = new BoxUserRequest
            {
                Name = "John Smith",
                IsPlatformAccessOnly = true
            };
            var user = await adminClient.UsersManager.CreateEnterpriseUserAsync(userRequest);
            Console.Write("New app user created with Id = {0}", user.Id);*/

            /******************************************************
            * Preflight Check + File Upload / Update
            ******************************************************/
            /* var fileName = "tax.txt";
            var folderId = "0";
            using (FileStream toUpload = new FileStream(@"/Users/jleblanc/localhost/box/net-jwt/tax.txt", FileMode.Open))
            {
                var preflightRequest = new BoxPreflightCheckRequest
                {
                    Name = fileName,
                    Size = toUpload.Length,
                    Parent = new BoxRequestEntity
                    {
                        Id = folderId
                    }
                };
                try
                {
                    var preflightCheck = await client.FilesManager.PreflightCheck(preflightRequest);
                    System.Console.WriteLine($"Preflight check passed: {preflightCheck.Success}");

                    //-----------------------------------------------------
                    // Preflight Check Passed - Upload File
                    //-----------------------------------------------------
                    BoxFile newFile;

                    // Create request object with name and parent folder the file should be uploaded to
                    using (FileStream stream = new FileStream(@"/Users/jleblanc/localhost/box/net-jwt/tax.txt", FileMode.Open))
                    {
                        BoxFileRequest req = new BoxFileRequest()
                        {
                            Name = "tax.txt",
                            Parent = new BoxRequestEntity() { Id = "0" }
                        };
                        BoxFile file = await client.FilesManager.UploadAsync(req, stream);
                        System.Console.WriteLine($"New file version uploaded for file ID: {file.Id}");
                    }
                }
                catch (BoxPreflightCheckConflictException<BoxFile> e)
                {
                    System.Console.WriteLine($"Preflight check failed for file ID: {e.ConflictingItem.Id}");
                
                    //-----------------------------------------------------
                    // Preflight Check Failed - Upload New File Version
                    //-----------------------------------------------------
                    using (FileStream fileStream = new FileStream(@"/Users/jleblanc/localhost/box/net-jwt/tax.txt", FileMode.Open))
                    {
                        BoxFile file = await client.FilesManager.UploadNewVersionAsync(e.ConflictingItem.Name, e.ConflictingItem.Id, fileStream);
                        System.Console.WriteLine($"New file version uploaded for file ID: {file.Id}");
                    }
                }
            }*/

            /******************************************************
            * Metadata Upload / Update
            ******************************************************/
            /* var metadataValues = new Dictionary<string, object>()
            {
                { "field1", "Tax information" },
                { "field2", "Internal" },
                { "field3", "active" }
            };

            try 
            {
                Dictionary<string, object> metadata = await client.MetadataManager.CreateFileMetadataAsync("438321273202", metadataValues, "enterprise", "customer_md_template1");
                System.Console.WriteLine("Added new metadata");
            }
            catch (Exception e)
            {
                JObject json = JObject.Parse(e.Message);
                var code = (string) json["code"];
                if (code == "tuple_already_exists")
                {
                    var updates = new List<BoxMetadataUpdate>()
                    {
                        new BoxMetadataUpdate()
                        {
                            Op = MetadataUpdateOp.replace,
                            Path = "/field1",
                            Value = "New Data"
                        }
                    };

                    Dictionary<string, object> updatedMetadata = await client.MetadataManager
                        .UpdateFileMetadataAsync("438321273202", updates, "enterprise", "customer_md_template1");
                
                    System.Console.WriteLine("Updated metadata");
                }
            }*/

            //var results = await client.SearchManager.SearchAsync("tax");
            //System.Console.WriteLine(results);  
        }
    }
}
