<div align="center">
<img width="1086" alt="Image" src="https://github.com/user-attachments/assets/384aadef-e759-4412-bd16-f64dea7a3f70" />
    <h1>ZenStack AI Chat Todo</h1>
</div>

A full-stack AI chat Todo app built with Next.js, ZenStack, and Vercel AI SDK. The app demonstrates how to easily add AI-chat feature for the application with minimal code using ZenStack's powerful data modeling and access control.

## Features

- **User Signup/Signin** - User authentication with NextAuth
- **AI Chat Todo Management** - Chat assistant to manage todos safely

## AI Chat Implementation

This project showcases how to quickly build AI chat functionality with minimal code:

- **Schema-Driven Development**: The `schema.zmodel` defines your data models and permissions
- **Generated CRUD Operations**: The `@core/zod` plugin automatically generates Zod schemas for input arguments of authorized CRUD operations
- **Streamlined Development**: Connect AI models to your data with minimal boilerplate

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- [ZenStack](https://zenstack.dev/) - Full-stack toolkit with access control
- [AI SDK](https://sdk.vercel.ai/) - AI integration for chat features

## Getting Started

### Installation

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables
   Rename `.env.example` to `.env` and replace your OpenAI Key with:

   ```bash
   OPENAI_API_KEY="write-your-openai-api-key-here"
   ```

3. Generate Prisma client and Zod schemas

   ```bash
   npm run generate
   ```

4. Synchronize database schema

   ```bash
   npm run db:push
   ```

5. Seed the database
   It create 3 users with todos. The password for all users is `123456`.

   ```typescript
   - Alex   (Backend Dev): alex@zenstack.dev
   - Taylor (FrontEnd Dev): taylor@zenstack.dev
   - Morgan (Product Lead): morgan@zenstack.dev
   ```

   ```bash
   npm run db:seed
   ```

6. Start the development server

   ```bash
   npm run dev
   ```
