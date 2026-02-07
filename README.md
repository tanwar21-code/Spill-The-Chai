# ☕ Spill The Chai

> An anonymous confession platform for students to share their deepest secrets, funny thoughts, and campus gossip. Brewed with Next.js & Supabase.

![Spill The Chai Banner](/public/abcd.png)

## ✨ Features

- **Anonymous Confessions**: Post thoughts without revealing your identity.
- **Real-time Feed**: See new confessions instantly as they are posted.
- **Voting System**: Upvote or downvote confessions to influence what trends.
- **Filtering**: Sort by **Latest** to see new tea or **Trending** to see popular posts.
- **Search**: Find specific confessions with a responsive search bar.
- **Comments & Replies**: Engage in anonymous discussions with nested threads.
- **Moderation Tools**:
  - **Report System**: Users can flag inappropriate content.
  - **Admin Dashboard**: Moderators can review and delete reported content at `/mod`.
- **Policies**: Dedicated pages for Content Policy, Privacy, and User Agreements.
- **Responsive Design**: Mobile-first UI built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui, Lucide React
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth (Anonymous & Email)
- **Real-time**: Supabase Realtime (for live feeds/comments)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/spill-the-chai.git
    cd spill-the-chai
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup:**
    Run the SQL scripts provided in the `database/` folder (or copy from `schema.sql`) in your Supabase SQL Editor to verify the schema for:
    - `confessions`
    - `votes`
    - `comments`
    - `reports`
    - `moderators`

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛡️ Moderation

To access the moderator dashboard:

1.  A user must be logged in.
2.  Their User ID (UUID) must be added to the `moderators` table in Supabase.
3.  Navigate to `/mod` to view and manage reported content.

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

_Brewed with ❤️ by the Spill The Chai Team._
