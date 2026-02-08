# 🚂 Deploying SNI-PER to Railway

Railway is the perfect platform for this bot because it allows **processes to run 24/7**.

## Step 1: Push to GitHub
I have already pushed the latest code to:
`https://github.com/Resteral/SNI-PER`

## Step 2: Create Railway Project
1.  Log in to [Railway.app](https://railway.app/).
2.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  Select `Resteral/SNI-PER`.
4.  Click **"Deploy Now"**.

## Step 3: Add Variables (Critical!)
Your bot needs your private key to run.
1.  Go to your project in Railway.
2.  Click on the **"Variables"** tab.
3.  Add the following variables:
    *   `PRIVATE_KEY`: Your Trust Wallet Private Key (e.g., `0x...`)
    *   `SIMULATION_MODE`: `true` (Start with `true` to test, change to `false` later)
4.  Railway will automatically restart the bot.

## Step 4: View Dashboard
1.  Go to the **"Settings"** tab.
2.  Scroll down to **"Domains"** and click **"Generate Domain"**.
3.  Open that URL to see your dashboard!
