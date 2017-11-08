package example.box.boxsamples;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity
import android.os.Bundle;
import android.app.Activity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.box.androidsdk.content.BoxApiFile;
import com.box.androidsdk.content.BoxConfig;

import com.box.androidsdk.content.BoxException;
import com.box.androidsdk.content.auth.BoxAuthentication;
import com.box.androidsdk.content.models.BoxEntity;
import com.box.androidsdk.content.models.BoxError;
import com.box.androidsdk.content.models.BoxFile;
import com.box.androidsdk.content.models.BoxSession;
import com.box.androidsdk.content.requests.BoxRequestsFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.util.ArrayList;

public class MainActivity extends AppCompatActivity implements BoxAuthentication.AuthListener {
    BoxSession session = null;

    private BoxApiFile mFileApi;

    @Override
    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        final Button button = (Button) findViewById(R.id.box_button);
        final Button blogout = (Button) findViewById(R.id.box_logout);
    }

    public void beginBoxAuth(View view) throws BoxException {
        Log.i("Auth", "Method hit");

        BoxConfig.CLIENT_ID = "YOUR BOX CLIENT ID";
        BoxConfig.CLIENT_SECRET = "YOUR BOX CLIENT SECRET";

        session = new BoxSession(this);
        session.setSessionAuthListener(this);
        session.authenticate(this);

        mFileApi = new BoxApiFile(session);

        showToast("Auth starting");
    }

    private void uploadNewVersion(final BoxFile file) {
        new Thread() {
            @Override
            public void run() {
                try {
                    String uploadFileName = "boxworks_logo.png";
                    InputStream uploadStream = getResources().getAssets().open(uploadFileName);
                    BoxRequestsFile.UploadNewVersion request = mFileApi.getUploadNewVersionRequest(uploadStream, file.getId());
                    final BoxFile uploadFileVersionInfo = request.send();
                    showToast("Uploaded new version of " + uploadFileVersionInfo.getName());
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (BoxException e) {
                    e.printStackTrace();
                    showToast("Upload failed");
                }
            }
        }.start();
    }

    @Override
    public void onRefreshed(BoxAuthentication.BoxAuthenticationInfo info) {
        showToast("Refreshed");
    }

    @Override
    public void onAuthCreated(BoxAuthentication.BoxAuthenticationInfo info) {
        //Init file, and folder apis; and use them to fetch the root folder
        mFileApi = new BoxApiFile(session);

        new Thread() {
            @Override
            public void run() {
                try {
                    String uploadFileName = "boxworks_logo.png";
                    InputStream uploadStream = getResources().getAssets().open(uploadFileName);
                    String destinationFolderId = "0";
                    String uploadName = "BoxSDKUpload.png";
                    BoxRequestsFile.UploadFile request = mFileApi.getUploadRequest(uploadStream, uploadName, destinationFolderId);
                    final BoxFile uploadFileInfo = request.send();
                    showToast("Uploaded " + uploadFileInfo.getName());
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (BoxException e) {
                    e.printStackTrace();
                    BoxError error = e.getAsBoxError();
                    if (error != null && error.getStatus() == HttpURLConnection.HTTP_CONFLICT) {
                        ArrayList<BoxEntity> conflicts = error.getContextInfo().getConflicts();
                        if (conflicts != null && conflicts.size() == 1 && conflicts.get(0) instanceof BoxFile) {
                            uploadNewVersion((BoxFile) conflicts.get(0));
                            return;
                        }
                    }
                    showToast("Upload failed");
                }
            }
        }.start();
    }

    @Override
    public void onAuthFailure(BoxAuthentication.BoxAuthenticationInfo info, Exception ex) {
        showToast("Auth failure");
    }

    @Override
    public void onLoggedOut(BoxAuthentication.BoxAuthenticationInfo info, Exception ex) {
        showToast("Logging out...");
    }

    @Override
    protected void onActivityResult (int requestCode, int resultCode, Intent data){
        if (resultCode == Activity.RESULT_OK){
            showToast("Activity completed");
        }
    }

    private void showToast(final String text) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(MainActivity.this, text, Toast.LENGTH_LONG).show();
            }
        });
    }

    public void boxLogout(View view){
        session.logout();
    }
}
