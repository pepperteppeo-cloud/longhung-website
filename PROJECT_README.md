# Long Hưng E-Commerce Admin Dashboard
## Vietnamese Stationery Product Management System

A full-stack e-commerce platform for Long Hưng stationery with:
- **Admin Dashboard** for employee access to manage products, articles, and orders
- **Public Website** for customers to browse products and read articles
- **RESTful API** built with Node.js/Express
- **PostgreSQL Database** with 7 tables and relationships
- **Image Optimization** with WebP conversion and resizing

---

## 🎯 Key Features

### Admin Capabilities
✅ **Employee Login** - JWT authentication for admin staff  
✅ **Product Management** - Create, read, update, delete products with images  
✅ **Article Publishing** - Write and publish blog posts/articles  
✅ **Category Management** - Organize products into categories  
✅ **Order Management** - Track customer orders and update status  
✅ **Image Handling** - Automatic WebP conversion, resizing to 800px max  

### Public Features
✅ **Product Browsing** - View products by category with search  
✅ **Article Reading** - Read published blog posts and articles  
✅ **Responsive Design** - Mobile-friendly interface  
✅ **Order Placement** - Customers can place orders  

---

## 🏗️ Architecture

### Frontend (Astro.js)
- **Pages**:
  - `/admin-login` - Admin authentication
  - `/admin/dashboard` - Admin dashboard with tabs
  - `/bai-viet` - Public articles listing
  - `/bai-viet/[slug]` - Article detail pages
  - `/san-pham` - Product listing
  - `/san-pham/[slug]` - Product detail pages

- **Components**:
  - `Header.astro` - Navigation with admin link
  - `Footer.astro` - Footer with links
  - `ContactForm.astro` - Contact form

- **Utils**:
  - `api.js` - Centralized API client with all endpoints

### Backend (Node.js/Express)
- **Models**: User, Category, Product, ProductImage, Order, Article
- **Controllers**: 
  - `authController.js` - Login, JWT generation
  - `productController.js` - CRUD with image processing
  - `categoryController.js` - Category management
  - `orderController.js` - Order tracking
  - `articleController.js` - Blog post management

- **Middleware**:
  - `auth.js` - JWT verification, role-based access
  - `upload.js` - File upload handling with validation

- **Utilities**:
  - `imageProcessor.js` - Sharp integration for image optimization
  - `slugify.js` - Vietnamese character handling
  - `helpers.js` - Validation and formatting

### Database (PostgreSQL)
- **Tables**: 
  - `users` - Admin staff accounts
  - `categories` - Product categories
  - `products` - Product catalog
  - `product_images` - Product image gallery
  - `articles` - Blog posts
  - `orders` - Customer orders
  - `order_items` - Order line items

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Initialization
```bash
npm run db:init
```
Creates PostgreSQL database with:
- Schema with all 7 tables
- Sample data (admin user, 5 products, 5 categories, 3 articles)
- Proper indexes and foreign keys

### 3. Environment Configuration
Create `.env` file in project root:
```env
# Backend
PORT=5000
DB_HOST=localhost
DB_USER=vpp_user
DB_PASSWORD=your_password
DB_NAME=vpp_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:4321,vpplonghung.com
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880

# Frontend
PUBLIC_API_URL=http://localhost:5000
PUBLIC_API_TIMEOUT=30000
```

### 4. Start Servers

**Backend (Terminal 1)**:
```bash
npm run dev
# Backend runs on http://localhost:5000
```

**Frontend (Terminal 2)**:
```bash
npm run dev
# Frontend runs on http://localhost:4321
```

---

## 🔐 Authentication

### Login Flow
1. User navigates to `/admin-login`
2. Enters email and password
3. Backend validates credentials and generates JWT token
4. Token stored in `localStorage` as `admin_token`
5. User redirected to `/admin/dashboard`
6. Token sent with each API request in Authorization header

### Test Credentials
```
Email: admin@vpplonghung.com
Password: Admin@123456
```

---

## 📡 API Endpoints

### Authentication
```
POST /api/auth/login
  Body: { email, password }
  Returns: { token, user: { id, name, email, role } }

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Returns: { user: { id, name, email, role } }
```

### Products
```
GET /api/products?page=1&limit=12&search=&category=
  Returns: { data: [products], total, page, pages }

GET /api/products/:slug
  Returns: { data: { product details } }

POST /api/products (Admin)
  Headers: Authorization: Bearer <token>
  Body: FormData with name, description, price, stock, category_id, image
  Returns: { data: { product } }

PUT /api/products/:id (Admin)
  Headers: Authorization: Bearer <token>
  Body: FormData with updatable fields
  Returns: { data: { updated product } }

DELETE /api/products/:id (Admin)
  Headers: Authorization: Bearer <token>
  Returns: { success: true }
```

### Articles
```
GET /api/articles?page=1&limit=10&search=
  Returns: { data: [published articles], total, page, pages }

GET /api/articles/:slug
  Returns: { data: { article with incremented view_count } }

GET /api/articles/admin/list?page=1&limit=20&published= (Admin)
  Headers: Authorization: Bearer <token>
  Returns: { data: [all articles including drafts] }

POST /api/articles (Admin)
  Headers: Authorization: Bearer <token>
  Body: FormData with title, content, excerpt, is_published, image
  Returns: { data: { article } }

PUT /api/articles/:id (Admin)
  Headers: Authorization: Bearer <token>
  Body: FormData with updatable fields
  Returns: { data: { updated article } }

PATCH /api/articles/:id/publish (Admin)
  Headers: Authorization: Bearer <token>
  Body: { is_published: true/false }
  Returns: { data: { article } }

DELETE /api/articles/:id (Admin)
  Headers: Authorization: Bearer <token>
  Returns: { success: true }
```

### Categories
```
GET /api/categories
  Returns: { data: [categories] }

POST /api/categories (Admin)
  Headers: Authorization: Bearer <token>
  Body: { name, description }
  Returns: { data: { category } }

PUT /api/categories/:id (Admin)
  Headers: Authorization: Bearer <token>
  Body: { name, description }
  Returns: { data: { updated category } }

DELETE /api/categories/:id (Admin)
  Headers: Authorization: Bearer <token>
  Returns: { success: true }
```

### Orders
```
GET /api/orders?page=1&limit=20&status= (Admin)
  Headers: Authorization: Bearer <token>
  Returns: { data: [orders], total }

GET /api/orders/:id (Admin)
  Headers: Authorization: Bearer <token>
  Returns: { data: { order details } }

POST /api/orders
  Body: { customer_name, customer_email, customer_phone, items: [], total_amount, payment_method, notes }
  Returns: { data: { order with order_number } }

PUT /api/orders/:id (Admin)
  Headers: Authorization: Bearer <token>
  Body: { updatable fields }
  Returns: { data: { updated order } }

PATCH /api/orders/:id/status (Admin)
  Headers: Authorization: Bearer <token>
  Body: { status: "pending|processing|shipped|delivered|cancelled", notes }
  Returns: { data: { order } }

DELETE /api/orders/:id (Admin)
  Headers: Authorization: Bearer <token>
  Returns: { success: true }
```

---

## 🛠️ Frontend API Client

### Usage Examples

**Import the API client**:
```javascript
import { authAPI, productAPI, articleAPI } from '@/utils/api';
```

**Login**:
```javascript
const response = await authAPI.login('admin@vpplonghung.com', 'Admin@123456');
localStorage.setItem('admin_token', response.data.token);
```

**Get Products**:
```javascript
const { data } = await productAPI.getAll(1, 12);
```

**Create Article**:
```javascript
const imageFile = document.querySelector('input[type="file"]').files[0];
const { data } = await articleAPI.create({
  title: 'Article Title',
  content: 'Article content',
  excerpt: 'Short excerpt',
  is_published: false
}, imageFile);
```

**Update Order Status**:
```javascript
await orderAPI.updateStatus(orderId, 'shipped', 'Order shipped today');
```

---

## 📊 File Structure

```
longhung-website-dev/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ContactForm.astro
│   │   └── ...
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── admin/
│   │   │   └── dashboard.astro
│   │   ├── admin-login.astro
│   │   ├── bai-viet.astro
│   │   ├── bai-viet/
│   │   │   └── [slug].astro
│   │   ├── san-pham.astro
│   │   └── ...
│   ├── utils/
│   │   └── api.js
│   ├── data/
│   │   ├── products.ts
│   │   └── product-image-map.json
│   └── styles/
│       ├── global.css
│       ├── navigation.css
│       └── ...
├── public/
│   ├── images/
│   ├── products/
│   └── uploads/
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Deployment

### Frontend runtime
- Deploy the Astro frontend to **Cloudflare Workers**.
- Do **not** use Cloudflare Pages for this SSR build.
- The site uses `nodejs_compat` in `wrangler.jsonc` because the product catalog reads `node:fs` and `node:path`.

### Production Build
```bash
npm run build
npm run deploy
```

### Deployment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to include the production domain
- [ ] Configure `PUBLIC_API_URL` for the Railway backend
- [ ] Configure PostgreSQL for production
- [ ] Set strong `JWT_SECRET`
- [ ] Enable HTTPS
- [ ] Set up SSL certificate
- [ ] Monitor error logs
- [ ] Verify Cloudflare Workers deployment

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Start PostgreSQL service:
```bash
# Windows
net start postgresql-x64-15

# macOS
brew services start postgresql
```

### Port 5000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Use different port:
```bash
PORT=5001 npm run dev
```

### Image Upload Fails
**Solution**: Check file size and format:
- Max size: 5MB (configurable via `MAX_FILE_SIZE`)
- Formats: JPEG, PNG, WebP, GIF

### JWT Token Expired
**Solution**: Clear localStorage and login again:
```javascript
localStorage.clear();
window.location.href = '/admin-login';
```

---

## 📚 Technologies Used

- **Frontend**: Astro, JavaScript, CSS
- **Backend**: Node.js, Express.js 5
- **Database**: PostgreSQL 15
- **ORM**: Sequelize
- **Authentication**: JWT, bcryptjs
- **File Processing**: Multer, Sharp
- **Validation**: Node validators
- **Deployment**: Node, npm

---

## 📖 API Documentation

See `README.md` in the backend directory for comprehensive API examples and cURL commands.

---

## 👤 Admin Users

Create additional admin users via API:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "admin2@vpplonghung.com",
    "password": "SecurePassword123",
    "role": "admin"
  }'
```

---

## 📝 License

Proprietary - Long Hưng Stationery

---

## 📞 Support

For issues or questions, contact the development team.

**Last Updated**: 2024  
**Version**: 1.0
