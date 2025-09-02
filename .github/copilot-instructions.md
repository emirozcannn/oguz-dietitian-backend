# Copilot Instructions for Oğuz Yolyapan Dietitian Website

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a bilingual (Turkish/English) React website for professional dietitian Oğuz Yolyapan. The website uses Bootstrap 5 for all styling and components.

## Key Guidelines

### Styling Requirements
- **MUST use Bootstrap 5** for all styling and components
- **NEVER use Tailwind CSS** - this is strictly prohibited
- Use Bootstrap Icons for all icons
- Implement responsive design using Bootstrap's grid system
- Use Bootstrap components for forms, buttons, modals, accordions, etc.

### Language Support
- Default language: Turkish (route: `/`)
- English translation: (route: `/en/`)
- Use react-i18next for all translations
- Language toggle must be available in header and footer
- All content must be translatable including dynamic content

### Technical Stack
- React with Vite
- Bootstrap 5 (no Tailwind)
- React Router for routing
- react-i18next for internationalization
- react-helmet-async for SEO
- react-hook-form for form handling

### Code Standards
- Use functional components with hooks
- Implement proper SEO with meta tags
- Follow accessibility guidelines (WCAG)
- Use semantic HTML
- Optimize for performance and mobile responsiveness

### Features to Implement
1. Bilingual home page with hero section
2. About page with professional biography
3. Blog system with multilingual posts
4. Service packages page
5. FAQ with accordion interface
6. Contact form with Google Maps
7. Appointment booking system
8. Client panel with authentication
9. Health calculators (BMI, BMR, etc.)
10. Admin panel for content management

### SEO Requirements
- Implement proper meta tags for both languages
- Use JSON-LD structured data
- Generate sitemaps for both language versions
- Optimize for search engines in both Turkish and English
