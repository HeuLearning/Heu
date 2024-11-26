# Heu Learning

## How to Get Started

### Cloning the Repository

To get a copy of the repository, run the following command:

```bash
git clone https://github.com/HeuLearning/Heu.git
```

### Navigate to the project directory: 

Navigate to the project directory and install the required npm packages:

```bash
cd Heu
npm install
```

### Setting Up Environment Variables
Create a .env.local file in the root of the project directory and add the following environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GT_API_KEY = your_gt_api_key
GT_PROJECT_ID = your_gt_project_key
NEXT_PUBLIC_POSTHOG_KEY=your_public_posthog_key
NEXT_PUBLIC_POSTHOG_HOST = public_posthog_host

```
Replace your_supabase_url and your_supabase_anon_key with our actual Supabase credentials.

Running the Project
To start the development server, use the following command:

```bash
npm run dev
```

This will start the development server and you can view the application at http://localhost:3000 in your browser.

