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

public class Main extends Config {
	private static final int MAX_CACHE_ENTRIES = 100;
	
	public static void main(String[] args) throws IOException, JSONException { 
		/********************************************************************
		 * JWT Auth with config file
		 *******************************************************************/
		Reader reader = new FileReader(Config.config_path);
		BoxConfig boxConfig = BoxConfig.readFrom(reader);
		
		// Set cache info
		int MAX_CACHE_ENTRIES = 100;
		IAccessTokenCache accessTokenCache = new InMemoryLRUAccessTokenCache(MAX_CACHE_ENTRIES);

		// Create new app enterprise connection object
		BoxDeveloperEditionAPIConnection client = BoxDeveloperEditionAPIConnection.getAppEnterpriseConnection(boxConfig, accessTokenCache);
		
		/********************************************************************
		 * JWT Auth without config file
		 *******************************************************************/
		/*File file = new File(Config.private_key);
		byte[] fileData = new byte[(int) file.length()];
		DataInputStream dis = new DataInputStream(new FileInputStream(file));
		dis.readFully(fileData);
		dis.close();
		
		String privateKey = new String(fileData);
		
		JWTEncryptionPreferences encryptionPref = new JWTEncryptionPreferences();
		encryptionPref.setPublicKeyID(Config.jwt_public_key_id);
		encryptionPref.setPrivateKey(privateKey);
		encryptionPref.setPrivateKeyPassword(Config.jwt_private_key_password);
		encryptionPref.setEncryptionAlgorithm(EncryptionAlgorithm.RSA_SHA_256);
		
		IAccessTokenCache accessTokenCache = new InMemoryLRUAccessTokenCache(MAX_CACHE_ENTRIES);
		BoxDeveloperEditionAPIConnection client = BoxDeveloperEditionAPIConnection.getAppEnterpriseConnection(Config.enterprise_id, Config.client_id, Config.client_secret, encryptionPref, accessTokenCache);
		*/
		
		/********************************************************************
		 * Perform action as user - AsUser Header
		 *******************************************************************/
		//String userId = "14516989";
		//client.asUser()
		//client.asSelf();
		
		/********************************************************************
		 * Perform action as user - User Access Token
		 *******************************************************************/
		//String userId = "14516989";
		//BoxDeveloperEditionAPIConnection client = new BoxDeveloperEditionAPIConnection(userId, DeveloperEditionEntityType.USER, boxConfig, accessTokenCache);
		
		/********************************************************************
		 * Upload file
		 *******************************************************************/
		// Set upload values
		/*String filePath = "/Users/jleblanc/eclipse-workspace/box-samples/temp.txt";
		String fileName = "current.txt";
		String folderId = "0";

		// Select Box folder
		BoxFolder folder = new BoxFolder(client, folderId);

		// Upload file
		FileInputStream stream = new FileInputStream(filePath);
		BoxFile.Info newFileInfo = folder.uploadFile(stream, fileName);
		stream.close();
		
		System.out.println(newFileInfo.getID());*/
		
		/********************************************************************
		 * Create new app user
		 *******************************************************************/
		// Set app user details
		/*String userName = "Java App User";
		String jobTitle = "Director of App Users";
		long spaceAmount = 1073741824;

		// Create param object
		CreateUserParams params = new CreateUserParams();
		params.setJobTitle(jobTitle);
		params.setSpaceAmount(spaceAmount);

		// Create app user
		BoxUser.Info createdUser = BoxUser.createAppUser(client, userName, params);
		
		System.out.println(createdUser.getID());*/
		
		/********************************************************************
		 * Create new managed user
		 *******************************************************************/
		String userName = "Java Managed User";
		String userEmail = "javauser123@test.com";
		String jobTitle = "Director of Managed Users";
		long spaceAmount = 1073741824;

		// Create param object
		CreateUserParams params = new CreateUserParams();
		params.setJobTitle(jobTitle);
		params.setSpaceAmount(spaceAmount);
		params.setRole(BoxUser.Role.COADMIN);

		// Create managed user
		BoxUser.Info createdUser = BoxUser.createEnterpriseUser(client, userEmail, userName, params);
		
		System.out.println(createdUser.getID());
		
		/********************************************************************
		 * Delete User
		 *******************************************************************/
		/*boolean notify = false;
		boolean force = false;
		String userID = "3941440444";
		
		BoxUser user = new BoxUser(client, userID);
		user.delete(notify, force);*/
		
		/****************************************************************
		* Collaborate user on a folder
		****************************************************************/
		/*String userId = "14516989";
		String folderId = "33552487093";

		BoxCollaborator user = new BoxUser(client, userId);
		BoxFolder folder = new BoxFolder(client, folderId);
		BoxCollaboration.Info collaboration = folder.collaborate(user, BoxCollaboration.Role.EDITOR);
		
		System.out.println(collaboration.getID());*/

		/****************************************************************
		* Remove folder collaboration
		****************************************************************/
		/*String collabId = "13690990530";
		
		BoxCollaboration collaboration = new BoxCollaboration(client, collabId);
		collaboration.delete();*/
		
		/****************************************************************
		* Create metadata template
		****************************************************************/
		// Define template headers
		/*String scope = "enterprise";
		String templateKey = "userTemplate1";
		String templateName = "User Template 1";

		// Define template fields
		MetadataTemplate.Field metadataID = new MetadataTemplate.Field();
		metadataID.setType("string");
		metadataID.setKey("field1");
		metadataID.setDisplayName("Field 1");

		MetadataTemplate.Field metadataName = new MetadataTemplate.Field();
		metadataName.setType("string");
		metadataName.setKey("field2");
		metadataName.setDisplayName("Field 2");

		MetadataTemplate.Field metadataPosition = new MetadataTemplate.Field();
		metadataPosition.setType("string");
		metadataPosition.setKey("field3");
		metadataPosition.setDisplayName("Field 3");

		// Add fields to list
		List<MetadataTemplate.Field> fields = new ArrayList<MetadataTemplate.Field>();
		fields.add(metadataID);
		fields.add(metadataName);
		fields.add(metadataPosition);

		// Create metadata template
		MetadataTemplate template = MetadataTemplate.createMetadataTemplate(client, scope, templateKey, templateName, false, fields);
		System.out.println(template.getTemplateKey() + " : " + template.getDisplayName());*/
		
		/****************************************************************
		* 409 error code - name conflict test 
		****************************************************************/
		/*String filePath = "/Users/jleblanc/eclipse-workspace/box-samples/temp.txt";
		String fileName = "current.txt";
		String folderId = "0";

		// Select Box folder
		BoxFolder folder = new BoxFolder(client, folderId);
		
		try {
			// Upload file
			FileInputStream stream = new FileInputStream(filePath);
			folder.uploadFile(stream, fileName);
			stream.close();
		} catch (Exception e) {
			if (e.getMessage().contains("item_name_in_use")) {
				System.out.println("Duplicate file name detected");
			}
	    }*/
		
		/****************************************************************
		* 409 error code - metadata conflict 
		****************************************************************/
		/*String fileId = "202727280023";
		//String metadataTemplate = "userTemplate1";
		//String scope = "enterprise";
		
		BoxFile file = new BoxFile(client, fileId);
		
		Metadata md = new Metadata();
		md.add("/field1", "Field 1");
		md.add("/field2", "Field 2");
		md.add("/field3", "Field 3");
		
		try {
			// Make call to add metadata
			file.createMetadata(md);
			System.out.println(file.getMetadata());
		} catch (Exception e) {
			if (e.getMessage().contains("tuple_already_exists")) {
				file.deleteMetadata();
				Metadata md2 = new Metadata();
				md2.add("/field1", "Revised Field 1");
				md2.add("/field2", "Revised Field 2");
				md2.add("/field3", "Revised Field 3");
				file.createMetadata(md2);
				
				System.out.println(file.getMetadata());
				
				Metadata md2 = new Metadata();
				md2.replace("/field1", "Revised Field 1");
				
				System.out.println("Metadata already present on file - updating");
				file.updateMetadata(md2);
				System.out.println(file.getMetadata());
			} else {
				System.out.println(e.getMessage());
			}
	    }*/
		
		/****************************************************************
		* Create webhook
		****************************************************************/
		/*String fileId = "313735807355";
		URL url = new URL("https://www.jcleblanc.com/");
		
		BoxFile file = new BoxFile(client, fileId);
		
		BoxWebHook.Info webhookInfo = BoxWebHook.create(file, url, BoxWebHook.Trigger.FILE_PREVIEWED);
		System.out.println(webhookInfo.getID());*/
		
		/****************************************************************
		* Update webhook
		****************************************************************/
		/*String webhookId = "82592516";
		URL url = new URL("https://www.testdomain5.com/");
		
		BoxWebHook webhook = new BoxWebHook(client, webhookId);
		
		BoxWebHook.Info info = webhook.getInfo();
		info.setAddress(url);
		webhook.updateInfo(info);
		
		System.out.println(info.getAddress());*/
		
		/****************************************************************
		* Delete webhook
		****************************************************************/
		/*String webhookId = "82592516";
		
		BoxWebHook webhook = new BoxWebHook(client, webhookId);
		webhook.delete();*/
		
		/****************************************************************
		* Downscope token
		****************************************************************/
		String file = "https://api.box.com/2.0/files/281739622236";
		
		List<String> scopes = new ArrayList<String>();
		scopes.add("item_preview");
		scopes.add("item_content_upload");

		ScopedToken token = client.getLowerScopedToken(scopes, file);
		System.out.println("Enterprise Token: " + client.getAccessToken());
		System.out.println("Downscoped Token: " + token.getAccessToken());
	}
}
