import static spark.Spark.*;

import java.io.FileInputStream;

import com.box.sdk.BoxAPIConnection;
import com.box.sdk.BoxFile;
import com.box.sdk.BoxFolder;
import com.box.sdk.BoxItem;

public class Main extends Config {
	public static void main(String[] args) { 
		get("/start", (req, res) -> {
			// Redirect user to login with Box
			String box_redirect = Config.box_redirect
	        		+ "?response_type=code"
	        		+ "&client_id=" + Config.client_id 
	        		+ "&redirect_uri=" + Config.redirect_uri;
	        	res.redirect(box_redirect);
	        	
	        	return "Redirecting...";
        });
        
        get("/return", (req, res) -> {
        		// Capture auth code 
        		String code = req.queryParams("code");  
        		
        		// Instantiate new Box API connection object
        		BoxAPIConnection api = new BoxAPIConnection(Config.client_id, Config.client_secret, code);
        		
        		// Upload new file
        		BoxFolder rootFolder = BoxFolder.getRootFolder(api);
        		FileInputStream stream = new FileInputStream(Config.file_path);
        		BoxFile.Info newFileInfo = rootFolder.uploadFile(stream, "tax123.txt");
        		stream.close();
        		
        		// Display root folder contents
        		/*BoxFolder rootFolder = BoxFolder.getRootFolder(api);
	        	for (BoxItem.Info itemInfo : rootFolder) {
	        	    System.out.format("[%s] %s\n", itemInfo.getID(), itemInfo.getName());
	        	}*/
        	
        	    return "Display page";
        });
    }
}