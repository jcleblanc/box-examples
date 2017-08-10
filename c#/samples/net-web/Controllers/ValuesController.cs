using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Box.V2;
using Box.V2.Config;
using Box.V2.JWTAuth;
using Box.V2.Models;

namespace net_web.Controllers
{
    [Route("api/[controller]")]
    public class ValuesController : Controller
    {
        // modify the app.config file to reflect your Box app config values
        static readonly string CLIENT_ID = "YOUR CLIENT ID";
        static readonly string CLIENT_SECRET = "YOUR CLIENT SECRET";
        static readonly string ENTERPRISE_ID = "YOUR ENTERPRISE ID";
        static readonly string REDIRECT_URL = "http://localhost:5000/api/values/return";

        static BoxConfig config = new BoxConfig(CLIENT_ID, CLIENT_SECRET, new Uri(REDIRECT_URL));
        static BoxClient client = new BoxClient(config);

        // GET api/values
        [HttpGet]
        public RedirectResult Get()
        {
            return Redirect(config.AuthCodeUri.ToString());
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public async Task Get(int id)
        {
            var code = Request.Query["code"];
            await client.Auth.AuthenticateAsync(code);

            BoxFile newFile;

            // Create request object with name and parent folder the file should be uploaded to
            using (FileStream stream = new FileStream("taxy.txt", FileMode.Open))
            {
                BoxFileRequest req = new BoxFileRequest()
                {
                    Name = "taxy.txt",
                    Parent = new BoxRequestEntity() { Id = "0" }
                };
                newFile = await client.FilesManager.UploadAsync(req, stream);
            }
            
            /*foreach(PropertyDescriptor descriptor in TypeDescriptor.GetProperties(items))
            {
                string name=descriptor.Name;
                object value=descriptor.GetValue(items);
                Console.WriteLine("{0}={1}",name,value);
            }*/
        }
    }
}
