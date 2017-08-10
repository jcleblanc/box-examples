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
        static readonly string CLIENT_ID = "YOUR CLIENT ID";
        static readonly string CLIENT_SECRET = "YOUR CLIENT SECRET";
        static readonly string ENTERPRISE_ID = "YOUR ENTERPRISE ID";
        static readonly string JWT_PRIVATE_KEY_PATH = "private.pem";
        static readonly string JWT_PRIVATE_KEY_PASSWORD = "YOUR PRIVATE KEY PASSWORD";
        static readonly string JWT_PUBLIC_KEY_ID = "YOUR PRIVATE KEY ID";
        
        static void Main(string[] args)
        {
            Task t = MainAsync();
            t.Wait();

            Console.WriteLine();
            Console.Write("Press return to exit...");
            Console.ReadLine();
        }

        static async Task MainAsync()
        {
            var privateKey = File.ReadAllText(JWT_PRIVATE_KEY_PATH);
            
            var boxConfig = new BoxConfig(CLIENT_ID, CLIENT_SECRET, ENTERPRISE_ID, privateKey, JWT_PRIVATE_KEY_PASSWORD, JWT_PUBLIC_KEY_ID);
            var boxJWT = new BoxJWTAuth(boxConfig);

            var adminToken = boxJWT.AdminToken();
            Console.WriteLine("Admin Token: " + adminToken);

            var adminClient = boxJWT.AdminClient(adminToken);

            BoxFile newFile;

            // Create request object with name and parent folder the file should be uploaded to
            using (FileStream stream = new FileStream(@"/PATH/TO/FILE/tax.txt", FileMode.Open))
            {
                BoxFileRequest req = new BoxFileRequest()
                {
                    Name = "tax.txt",
                    Parent = new BoxRequestEntity() { Id = "0" }
                };
                newFile = await adminClient.FilesManager.UploadAsync(req, stream);
            }
        }
    }
}
