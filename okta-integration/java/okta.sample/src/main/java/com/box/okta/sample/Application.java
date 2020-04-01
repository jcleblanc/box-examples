package com.box.okta.sample;

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.net.URL;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.box.sdk.BoxAPIRequest;
import com.box.sdk.BoxConfig;
import com.box.sdk.BoxDeveloperEditionAPIConnection;
import com.box.sdk.BoxJSONResponse;
import com.box.sdk.BoxUser;
import com.box.sdk.CreateUserParams;
import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;
import com.eclipsesource.json.JsonValue;

@RestController
@EnableAutoConfiguration
public class Application {
	
	@RequestMapping("/")
    String home(@AuthenticationPrincipal OidcUser user) throws IOException {
		// Get Okta user sub for unique ID attachment to Box user
		Object oktaSub = user.getAttributes().get("sub");
				
		// Set up Box enterprise client
		Reader reader = new FileReader("config.json");
		BoxConfig config = BoxConfig.readFrom(reader);
		BoxDeveloperEditionAPIConnection api = BoxDeveloperEditionAPIConnection.getAppEnterpriseConnection(config);
		
		// Check all enterprise users for matching external_app_user_id against Okta sub
		URL url = new URL("https://api.box.com/2.0/users?external_app_user_id=" + oktaSub);
		BoxAPIRequest request = new BoxAPIRequest(api, url, "GET");
		BoxJSONResponse jsonResponse = (BoxJSONResponse) request.send();
		JsonObject jsonObj = jsonResponse.getJsonObject();
		JsonValue totalCount = jsonObj.get("total_count");
		
		// Set return string
		String outputString = "";
		
		if (totalCount.asInt() > 0) {
			// User found, authenticate as user
			// Fetch user ID
			JsonArray entries = (JsonArray) jsonObj.get("entries");
			JsonObject userRecord = (JsonObject) entries.get(0);
			JsonValue userId = userRecord.get("id");
			
			// Get user scoped access token and fetch current user with it
			BoxDeveloperEditionAPIConnection userApi = BoxDeveloperEditionAPIConnection.getAppUserConnection(userId.asString(), config);
			BoxUser currentUser = BoxUser.getCurrentUser(userApi);
			BoxUser.Info currentUserInfo = currentUser.getInfo();
			
			outputString = "Hello " + currentUserInfo.getName();
		} else {
			// No user found, create new app user from Okta record
			String oktaName = (String) user.getAttributes().get("name");
			CreateUserParams params = new CreateUserParams();
			params.setExternalAppUserId((String) oktaSub);
			BoxUser.Info createdUserInfo = BoxUser.createAppUser(api, oktaName, params);
			
			outputString = "New User Created: " + createdUserInfo.getName();
		}
		
		return outputString;
    }
	
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}