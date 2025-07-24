Here's the step-by-step guide to creating Google OAuth2 credentials for your application, formatted in a clearer and structured way for better readability:

---

### **Steps to Create Google OAuth 2.0 Credentials**

1. **Navigate to Google Cloud Console** Go to the following link:
   [Google Cloud Console](https://console.cloud.google.com/projectselector2/iam-admin/settings?organizationId=0&inv=1&invt=Ab1eTg&supportedpurview=project,organizationId,folder&orgonly=true).

2. **Create a New Project**

     - Click on **"Create Project"** at the top right corner.
     - Enter a project name (e.g., `kappes2`) and leave the location as default (do not select any location).
     - Click **"Create"**. A notification will appear; click **"Select Project"** or follow this link to select the project:
       [Project Selection](https://console.cloud.google.com/projectselector2/iam-admin/settings?organizationId=0&inv=1&invt=Ab1eTg&supportedpurview=project,organizationId,folder&orgonly=true).

3. **Select the Recently Created Project**

     - Select the recently created project, e.g., `kappes2`.

4. **Open the Sidebar**

     - Click on the **hamburger menu icon** (three horizontal lines) in the top-left corner. The sidebar will pop up.

5. **Enable APIs**

     - Go to **"APIs & Services"** and then click on **"Enabled APIs and services"**.

6. **OAuth Consent Screen**

     - In the left sidebar, click **"OAuth consent screen"**.
     - Click on **"Get Started"**.

7. **Configure OAuth Consent Screen**

     - **App Name**: Enter a name for your app (e.g., `kappes2App`).
     - **User Support Email**: Enter an email (e.g., `asifaowadud@gmail.com`).
     - Click **"Next"** to continue.

8. **Select Audience Type**

     - Select **"External"** audience.
     - Click **"Next"**.

9. **Provide Contact Info**

     - **Email Address**: Enter an email address (e.g., `asifaowadud@gmail.com`).
     - Click **"Next"** to proceed.

10. **Agree to Terms and Finish**

     - Tick the **Agree to the terms** checkbox.
     - Click **"Continue"** and then click **"Create"**.

11. **Create OAuth Client**

     - Click on **"Create OAuth Client"**.

12. **Choose Application Type**

     - Select **"Web application"**.
     - Provide a **name** for the client (e.g., `kappes2App`).

13. **Configure Redirect URIs**

     - **Authorized redirect URIs**: Enter the URI for your callback (e.g., `http://localhost:7000/api/v1/auth/google/callback`).
     - Click **"Create"**.

14. **Copy Client ID**

     - A pop-up will appear. Copy the **Client ID** and click **"OK"**.
     - You will be redirected to the OAuth clients page:
       [OAuth Clients](https://console.cloud.google.com/auth/clients?inv=1&invt=Ab1egg&orgonly=true&project=kappes2&supportedpurview=project,organizationId,folder).

15. **Access Client ID and Secret**

     - In the **Client ID** table, select the recently created project (`kappes2App`).
     - You will be redirected to a page displaying the **Client ID** and **Client Secret**.
     - Copy both the **Client ID** and **Client Secret**.

16. **Add to Your Config File**

     - Paste the copied **Client ID** and **Client Secret** into your application's configuration file.

     **Example:**

     ```bash
     Client ID = 3728050386-jtd9meu32rbkq1994sq4s9b9kninhofv.apps.googleusercontent.com
     Client Secret = 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
     ```

---

This structured format makes the process clear and easy to follow. Each step is designed to guide you through creating the OAuth credentials and integrating them into your application.
