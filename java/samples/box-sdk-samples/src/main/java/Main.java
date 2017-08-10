import static spark.Spark.*;
import com.box.sdk.BoxAPIConnection;
import com.box.sdk.BoxFolder;
import com.box.sdk.BoxItem;

public class Main extends Config {
	public static void main(String[] args) {    	
        get("/start", (req, res) -> {
	        String box_redirect = "https://account.box.com/api/oauth2/authorize?"
	        		+ "response_type=code"
	        		+ "&client_id=" + Config.client_id 
	        		+ "&redirect_uri=" + Config.redirect_uri;
	        	res.redirect(box_redirect);
	        	
	        	return "hello";
        });
        
        get("/return", (req, res) -> {
        		String code = req.queryParams("code");  
        		
        		BoxAPIConnection api = new BoxAPIConnection(Config.client_id, Config.client_secret, code);
        		
        		BoxFolder rootFolder = BoxFolder.getRootFolder(api);
	        	for (BoxItem.Info itemInfo : rootFolder) {
	        	    System.out.format("[%s] %s\n", itemInfo.getID(), itemInfo.getName());
	        	}
        	
        	    return "response";
        });
    }
}