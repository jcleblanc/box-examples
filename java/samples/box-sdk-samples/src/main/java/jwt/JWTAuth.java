package jwt;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import com.box.sdk.BoxDeveloperEditionAPIConnection;
import com.box.sdk.BoxUser;
import com.box.sdk.EncryptionAlgorithm;
import com.box.sdk.IAccessTokenCache;
import com.box.sdk.InMemoryLRUAccessTokenCache;
import com.box.sdk.JWTEncryptionPreferences;

public class JWTAuth extends Config {
	private static final int MAX_CACHE_ENTRIES = 100;
	
	public static void main(String[] args) throws IOException { 
		// Read private key file
		File file = new File(Config.private_key);
        byte[] fileData = new byte[(int) file.length()];
        DataInputStream dis = new DataInputStream(new FileInputStream(file));
        dis.readFully(fileData);
        dis.close();

        String privateKey = new String(fileData);

        // Set up private key encryption info
        JWTEncryptionPreferences encryptionPref = new JWTEncryptionPreferences();
        encryptionPref.setPublicKeyID(Config.jwt_public_key_id);
        encryptionPref.setPrivateKey(privateKey);
        encryptionPref.setPrivateKeyPassword(Config.jwt_private_key_password);
        encryptionPref.setEncryptionAlgorithm(EncryptionAlgorithm.RSA_SHA_256);
		
        // Create new API connection
		IAccessTokenCache accessTokenCache = new InMemoryLRUAccessTokenCache(MAX_CACHE_ENTRIES);
		BoxDeveloperEditionAPIConnection api = BoxDeveloperEditionAPIConnection.getAppEnterpriseConnection(Config.enterprise_id, Config.client_id, Config.client_secret, encryptionPref, accessTokenCache);

		// Create new app user
		BoxUser.Info createdUserInfo = BoxUser.createAppUser(api, "New User 123");
		System.out.println("User created");
	}
}
