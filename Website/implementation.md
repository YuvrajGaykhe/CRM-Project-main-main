Sigma Audio — Website Implementation Plan
Multi-page website · DB-connected products · Dealer + Admin portals · EasyFolio Bootstrap template base

What gets built
assets/css/sigma.css
Global Design System
CSS variables — saffron palette, Bebas Neue + Nunito fonts, spacing, button classes, cards
_navbar.html
Shared Navbar
Logo, nav links, Dealer Login CTA, mobile hamburger — reused on every page
_footer.html
Shared Footer
Links, social, WhatsApp float button, copyright
assets/js/main.js
Core JS
Scroll spy, navbar shrink, AOS reveal, mobile menu — same pattern as EasyFolio main.js
Colour tokens (from aa.html → new palette)
Primary
#E8711A — Saffron
Background glass white
Text
#FFF5E6 / #C8A87A — Cream
Action CTA
#2E7D32 — Trust Green
Template adaptation from EasyFolio
Keep Bootstrap 5 grid + vendor JS (AOS, Swiper, GLightbox) from EasyFolio — do not rewrite
Replace EasyFolio's main.css entirely with sigma.css using same CSS variable structure
Reuse EasyFolio's sticky header pattern, scroll-top button, and navmenu scrollspy from main.js
Replace Roboto/Questrial fonts with Bebas Neue (headings) + Nunito (body)

Pages in this phase
index.html
Home
Hero · stats strip · 3 featured products (static) · why us · testimonials · dealer CTA · contact form snippet
about.html
About Us
Brand story · founding year · factory photo · Made in India section · awards/certifications
contact.html
Contact
Full contact form · phone, WhatsApp, map embed · "I am a dealer/customer" dropdown · PHP mailer via contact.php
Sections in index.html (order matters)
Hero
— full-viewport, bg image with overlay, headline, 2 CTAs (Explore Products / Become a Dealer), trust badges
Stats strip
— 10K+ sold, 250+ dealers, 8+ states, 24/7 support · 4-column grid with glass cards
Product preview
— static 3-card row linked to products.html · "View All" CTA
Why Sigma
— 4 feature boxes (High Power, Rugged Build, Pure Sound, Made for India)
Comparison table
— BCD202 vs BCD2401 vs BC202 PRO specs side by side
Testimonials
— 3 dealer quotes, Punjab / Maharashtra / Rajasthan
Dealer network
— state cards + "Become a Dealer" banner
Contact snippet
— phone / WhatsApp / short form, links to contact.html
Contact form handling
Use EasyFolio's contact.php pattern — swap receiving email with client's address
Fields: Name, Mobile Number (not email first), City, "I am a..." dropdown, Message
WhatsApp redirect button alongside the form — critical for village audience
Pages in this phase
products.html
Products Catalogue
Filter by category · product cards from API · search by name · "Get Quote" CTA per card
product-detail.html
Product Detail
Full specs table · image gallery (Swiper) · related products · "Contact Dealer" CTA · download datasheet
api/products/
Django REST API
GET /api/products/ · GET /api/products/:id/ · filter by category, search by name · public endpoints, no auth
Database model — Product
Fields:
id, name, model_code, category, description, channels, rms_power, peak_power, voltage, protection_type, pcb_grade, warranty_months, image (ImageField), datasheet (FileField), is_featured, created_at
Categories:
"4 Channel", "2 Channel", "Premium", "Subwoofer" — stored as choices for filter dropdown
Admin can add/edit/delete products
from Django admin panel in Phase 5 — no price shown publicly
Frontend API call pattern (no framework, plain JS)
products.html fetches
/api/products/?category=X
on load, renders product cards dynamically into a Bootstrap grid
product-detail.html reads
?id=
from URL params, fetches
/api/products/:id/
, populates all sections
Image gallery uses EasyFolio's GLightbox + Swiper (already in vendor folder) — no extra dependencies
Category filter uses Bootstrap's Isotope pattern from EasyFolio portfolio section — reuse filter-active logic
Django backend setup
Framework
Django 5 + DRF
Database
PostgreSQL
Media
Local / S3
CORS
django-cors-headers

Pages in this phase
dealer/login.html
Dealer Login
Username + password · JWT token auth · "Forgot password" link · remember device
dealer/dashboard.html
Dealer Dashboard
My customers · pending invoices · total sales · quick links to create invoice
dealer/invoice-create.html
Create Invoice
Select customer · add products (from DB) · qty + dealer price · auto-calculate total · generate PDF
dealer/invoice-list.html
Invoice History
All invoices with date · status (paid/pending) · download PDF · share via WhatsApp
dealer/catalogue.html
Dealer Catalogue
Product list with dealer pricing (hidden from public) · downloadable spec sheets
Backend models needed
Dealer model:
User (Django auth) + dealer profile (state, city, contact, GST number, status: active/pending)
Customer model:
name, mobile, city, assigned dealer (FK), created_at
Invoice model:
invoice_number, dealer (FK), customer (FK), date, items (JSON), subtotal, GST, total, status, pdf_file
DealerProduct model:
product (FK), dealer_price — dealer-specific pricing, hidden from public API
Invoice PDF generation
Use
WeasyPrint
on Django side — render invoice HTML template → PDF → serve as download
Invoice template: Sigma Audio letterhead, dealer info, customer info, product table, GST breakdown, total, signature box
WhatsApp share: generate PDF → store in media → pass URL to
wa.me/?text=URL
Auth flow
JWT via djangorestframework-simplejwt · store access + refresh token in localStorage
All dealer API endpoints check
IsDealer
permission class — role-based guard
Auto-redirect to login if token expired; refresh silently if refresh token valid
Pages in this phase
admin/login.html
Admin Login
Superuser credentials · separate from dealer login · stricter auth
admin/dashboard.html
Admin Dashboard
Total sales · active dealers · pending inquiries · product count · recent invoices
admin/products.html
Product Management
Add / edit / delete products with image upload · set featured · manage categories
admin/dealers.html
Dealer Management
Approve / reject dealer applications · set dealer pricing · view per-dealer sales
admin/invoices.html
Invoice Overview
All invoices across all dealers · filter by state / date / status · export CSV
admin/inquiries.html
Customer Inquiries
All contact form submissions · assign to dealer · mark resolved
Admin-only API endpoints
POST/PUT/DELETE
/api/products/
— product CRUD, guarded by
IsAdminUser
GET/PATCH
/api/dealers/
— list all dealers, approve/suspend accounts
GET
/api/invoices/?dealer=X&date_from=Y
— full invoice export with filters
GET
/api/inquiries/
— contact form submissions, assignable to dealers
Deployment stack
Server
Ubuntu VPS / cPanel
Web server
Nginx + Gunicorn
Static files
Nginx serves /static/
Media files
Nginx serves /media/
DB
PostgreSQL 15
SSL
Let's Encrypt
