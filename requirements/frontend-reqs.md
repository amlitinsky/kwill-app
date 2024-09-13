
OBJECTIVES OF THE FRONTEND:
1. Landing Page
- The landing page is the first page when a user visits the website 
- At the bottom of the landing page, there should be links for a "Terms of Service" and a "Privacy Policy" page  basically just utility pages
- At the top of the landing page in the top right corner, there's a "Login"  and in the landing page, there is a "Sign Up" button that directs the user to the login or sign-up page 
- There should also be some sort of navbar (we start at home), with links to like product, and we still have the same navbar, so the user can navigate to different pages and back

2. Terms of Service and Privacy Policy
- These pages are pretty much just utility pages that are required by law to be present on the website

3. Login and Sign Up (authentication 03 and 04)
- Seperate pages, but there is a form to login or sign up but we can just use the shadcn UI
- There is a "Login with Google" button that will use the supabase auth to login with google
- There is a "Login with Email" button that will use the supabase auth to login with email

- Once we've logged in or signed up successfully, we should redirect user to an entirely separte page, with a different navbar and different content and pages

4. Dashboard (Homepage in the Auth)
- should look like dashboard-01

5. Settings 
- should look like shadcn dashboard-04

6. Add New Query
- should look like dashboard-07




PAGE DIRECTORY STRUCTURE FOR KWILL (UI/UX Objectives) (all of this is in the app router/directory):
/app
    /public (for public pages and the landing page)
        /nav-bar (for the navbar that is shared across the website) (still image of company logo top left corner) (links to the homepage, product, and pricing) (the extra space between the slash and content is to reveal the nature of the navigation experience)
        / landing page (P1)
        - in the center a place to sign up
            /signup (for signup info) (auth-03) (sign up with google, and email)
        - top right corner there is a login page
            /login (for login info) (auth-04) (login with google, and email)
        - at the bottom of the landing page, there should be links for a "Terms of Service" and a "Privacy Policy" page  basically just utility pages
            /terms of service page (these don't need to be in the navbar, the user should be able to navigate to these pages from the footer) (P2)
            /privacy policy page (these don't need to be in the navbar, the user should be able to navigate to these pages from the footer) (P2)
        / pricing page
        / product page
    /auth (for authentication pages)
        /nav-bar (for pages that are shared across the website) (still image of company logo top left corner) (profile pic in top right corner, also some sort of sign out button)(links to dashboard, analytics, billing, and settings) (the extra space between the slash and content is to reveal the nature of the navigation experience)
        / dashboard (for dashboard info) (dasboard-01)
            - displays information about the user's queries and their status
            - there is a button to add a new query
            /create-query (for create query info) (dasboard-07)
        / settings (for settings info) (dasboard-04)
        / analytics (for interesting analytics about the user's queries)
        / billing (for billing info)
    layout.tsx (the layout that is shared across the website)
    page.tsx (the page that is shared across the website)
    ...(api, etc. not relevant to the frontend)

QUESTIONS:
With the page.tsx and layout.tsx, how will we display public pages and then private pages? (The default page is the public page)
How will we automatically logout the user when their session ends?


TOOLS USED TO CREATE FRONTEND:
- NextJS 14
- App Router
- TailwindCSS
- ShadCN
- Supabase Auth
- Supabase Database
- Supabase Storage
- Supabase Functions
- Supabase Realtime
- v0 by Vercel

CURRENT TODOS:
- Move the transcript.tsx and ZoomLinkForm.tsx to the app/queries directory