# Inneparkert - Frontend

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```

2.  **Install pnpm (if you don't have it):**

    ```bash
    npm install -g pnpm@latest
    ```

    See [https://pnpm.io/installation](https://pnpm.io/installation) for more details.

3.  **Install dependencies:**

    ```bash
    pnpm install
    ```

4.  **Create a `.env` file:**

    Create a `.env` file in the project root directory with the following variables:

    ```
    NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
    ```

5.  **Run the application:**

    ```bash
    pnpm dev
    ```

    The application will start on `http://localhost:3000`.
