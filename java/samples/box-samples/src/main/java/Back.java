import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

import com.box.sdk.BoxCollaboration;
import com.box.sdk.BoxCollaborator;
import com.box.sdk.BoxConfig;
import com.box.sdk.BoxDeveloperEditionAPIConnection;
import com.box.sdk.BoxFile;
import com.box.sdk.BoxFolder;
import com.box.sdk.BoxUser;
import com.box.sdk.BoxWebHook;
import com.box.sdk.CreateUserParams;
import com.box.sdk.DeveloperEditionEntityType;
import com.box.sdk.EncryptionAlgorithm;
import com.box.sdk.IAccessTokenCache;
import com.box.sdk.InMemoryLRUAccessTokenCache;
import com.box.sdk.JWTEncryptionPreferences;
import com.box.sdk.Metadata;
import com.box.sdk.MetadataTemplate;
import com.box.sdk.ScopedToken;

public class Back extends Config {
	private static final int MAX_CACHE_ENTRIES = 100;
	
	public static void main(String[] args) throws IOException, JSONException { 
		// Read config file into Box Config object
		Reader reader = new FileReader(Config.config_path);
		BoxConfig boxConfig = BoxConfig.readFrom(reader);
		
		// Set cache info
		int MAX_CACHE_ENTRIES = 100;
		IAccessTokenCache accessTokenCache = new InMemoryLRUAccessTokenCache(MAX_CACHE_ENTRIES);

		// Create new app enterprise connection object
		BoxDeveloperEditionAPIConnection client = BoxDeveloperEditionAPIConnection.getAppEnterpriseConnection(boxConfig, accessTokenCache);
		
		String filePath = "temp.txt";
		String fileName = "myTempDoc.txt";
		String folderId = "0";
		
		// Select Box folder
		BoxFolder folder = new BoxFolder(client, folderId);
		
		// Upload file
		try {
			FileInputStream stream = new FileInputStream(filePath);
			BoxFile.Info newFileInfo = folder.uploadFile(stream, fileName);
			stream.close();
			System.out.println(newFileInfo.getID());
		} catch (Exception e) {
			if (e.getMessage().contains("item_name_in_use")) {
				FileInputStream stream = new FileInputStream(filePath);
				BoxFile.Info newFileInfo2 = folder.uploadFile(stream, "myTempDoc(2).txt");
				stream.close();
				System.out.println(newFileInfo2.getID());
			}
		}
		/*String userId = "14516989";
		String folderId = "33552487093";
		
		BoxFolder folderToCollab = new BoxFolder(client, folderId);
		BoxCollaboration.Info coOwner = folderToCollab.collaborate(new BoxUser(null, userId), BoxCollaboration.Role.CO_OWNER);
		
		System.out.println(coOwner.getID());
		*/
		/*String userId = "14516989";
		BoxDeveloperEditionAPIConnection session = new BoxDeveloperEditionAPIConnection(userId, DeveloperEditionEntityType.USER, boxConfig, accessTokenCache);
		String userAT = session.getAccessToken();
		//System.out.println(userAT);
		
		// Set upload values
		String filePath = "temp.txt";
		String fileName = "myTempDoc.txt";
		String folderId = "0";

		// Select Box folder
		BoxFolder folder = new BoxFolder(session, folderId);

		// Upload file
		FileInputStream stream = new FileInputStream(filePath);
		BoxFile.Info newFileInfo = folder.uploadFile(stream, fileName);
		stream.close();
		
		System.out.println(newFileInfo.getID());
		*/
		// Set app user details
		/*String userName = "BW Test User 1";
		String jobTitle = "Director of App Users";
		long spaceAmount = 1073741824;

		// Create param object
		CreateUserParams params = new CreateUserParams();
		params.setJobTitle(jobTitle);
		params.setSpaceAmount(spaceAmount);

		// Create app user
		BoxUser.Info createdUserInfo = BoxUser.createAppUser(client, userName);
		System.out.println(createdUserInfo.getID());*/
	}
}
