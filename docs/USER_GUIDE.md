# RoleRabbit User Guide

**Welcome to RoleRabbit!** This guide will help you create, customize, and publish your professional portfolio.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your Portfolio](#creating-your-portfolio)
3. [Customizing Your Portfolio](#customizing-your-portfolio)
4. [Publishing Your Portfolio](#publishing-your-portfolio)
5. [Subdomain Setup](#subdomain-setup)
6. [Custom Domain Setup](#custom-domain-setup)
7. [Analytics & Insights](#analytics--insights)
8. [Sharing Your Portfolio](#sharing-your-portfolio)
9. [FAQs](#faqs)

---

## Getting Started

### Sign Up

1. Go to [rolerabbit.com](https://rolerabbit.com)
2. Click "Get Started"
3. Sign up with:
   - Email and password
   - Google account
   - GitHub account

### Dashboard Overview

After signing in, you'll see:

- **My Portfolios**: List of your portfolios
- **Templates**: Browse available templates
- **Analytics**: View your portfolio stats
- **Settings**: Account settings

---

## Creating Your Portfolio

### Step 1: Choose a Template

1. Click **"Create Portfolio"**
2. Browse available templates
3. Click **"Preview"** to see template in action
4. Click **"Use This Template"**

**Popular Templates:**

- **Modern Developer**: Clean, minimalist design for developers
- **Creative Designer**: Bold, visual design for designers
- **Business Professional**: Corporate, professional layout
- **Freelancer**: Versatile, multi-purpose template

### Step 2: Enter Basic Information

Fill in your details:

- **Full Name**: Your professional name
- **Job Title**: Your current role (e.g., "Full Stack Developer")
- **Tagline**: Brief statement about you
- **Profile Photo**: Upload your professional headshot

**Tips:**
- Use a professional headshot with good lighting
- Keep job title concise and specific
- Make tagline memorable and unique

### Step 3: Add Sections

#### Hero Section

The first thing visitors see:

- **Headline**: Your name or brand
- **Subheadline**: Your role/expertise
- **Call-to-Action**: Button linking to your work or contact

**Example:**
```
Headline: John Doe
Subheadline: Full Stack Developer & UI/UX Enthusiast
CTA: View My Work → #projects
```

#### About Section

Tell your story:

- **Bio**: 2-3 paragraphs about your background
- **Highlights**: Key achievements
- **Skills**: Your core competencies
- **Resume**: Link to downloadable resume

**Writing Tips:**
- Start with your current role
- Highlight unique experiences
- Show personality while staying professional
- Use active voice

#### Experience Section

Add your work history:

1. Click **"Add Experience"**
2. Fill in details:
   - Company name
   - Position
   - Dates (Start - End or "Present")
   - Description
   - Key achievements

**Example:**
```
Company: Tech Startup Inc
Position: Senior Full Stack Developer
Dates: Mar 2020 - Present
Location: San Francisco, CA

Description:
Leading development of core platform features for B2B SaaS product
serving 10,000+ users.

Achievements:
• Reduced API response time by 60% through optimization
• Built CI/CD pipeline reducing deployment time by 80%
• Mentored team of 5 junior developers
```

#### Projects Section

Showcase your work:

1. Click **"Add Project"**
2. Fill in:
   - Project name
   - Description
   - Technologies used
   - Demo link (optional)
   - GitHub link (optional)
   - Screenshots

**Tips:**
- Feature 3-6 of your best projects
- Include screenshots or demos
- Quantify impact when possible
- Link to live demos

#### Skills Section

Organize your skills:

1. Create skill categories (e.g., "Frontend", "Backend", "Tools")
2. Add skills to each category
3. Set proficiency levels (optional)

**Example:**
```
Frontend Development:
- React (5/5) - 5 years
- TypeScript (5/5) - 4 years
- Next.js (4/5) - 3 years

Backend Development:
- Node.js (5/5) - 5 years
- PostgreSQL (4/5) - 4 years
- GraphQL (4/5) - 3 years
```

#### Contact Section

Make it easy to reach you:

- **Email**: Your professional email
- **Phone**: Optional phone number
- **Location**: City, state/country
- **Social Links**: LinkedIn, GitHub, Twitter, etc.
- **Contact Form**: Enable/disable form
- **Availability**: Show if you're open to opportunities

---

## Customizing Your Portfolio

### Theme Customization

#### Colors

1. Click **"Customize Theme"**
2. Choose your colors:
   - **Primary Color**: Main brand color
   - **Secondary Color**: Accent color
   - **Background**: Page background
   - **Text**: Text color

**Tips:**
- Use high contrast for readability
- Stick to 2-3 main colors
- Test on mobile devices

#### Fonts

1. Go to **Theme → Typography**
2. Choose fonts:
   - **Heading Font**: For titles
   - **Body Font**: For text

**Popular Combinations:**
- Modern: Inter + Inter
- Professional: Roboto + Open Sans
- Creative: Poppins + Lato

#### Layout

1. Go to **Theme → Layout**
2. Choose options:
   - **Navigation**: Top, sticky, or side
   - **Section Spacing**: Compact, normal, or relaxed
   - **Max Width**: Container width
   - **Border Radius**: Rounded corners

### Section Ordering

Drag and drop sections to reorder:

1. Click **"Edit Layout"**
2. Drag sections up or down
3. Click **"Save Order"**

**Recommended Order:**
1. Hero
2. About
3. Experience
4. Projects
5. Skills
6. Education (if relevant)
7. Contact

### Hide/Show Sections

1. Click **"Edit Layout"**
2. Toggle visibility for each section
3. Hidden sections won't appear on published portfolio

---

## Publishing Your Portfolio

### Before Publishing

**Checklist:**
- [ ] All sections filled out
- [ ] Profile photo uploaded
- [ ] Links tested (demo URLs, GitHub, social)
- [ ] Content proofread
- [ ] Preview on mobile and desktop
- [ ] SEO title and description set

### Publish

1. Click **"Publish"** button
2. Review publish settings:
   - **Visibility**: Public or unlisted
   - **SEO Settings**: Title, description
   - **Social Preview**: Open Graph image
3. Click **"Publish Now"**

Your portfolio will be live at:
```
https://<your-subdomain>.rolerabbit.com
```

### Unpublish

To take your portfolio offline:

1. Go to **Settings → Publishing**
2. Click **"Unpublish"**
3. Confirm

**Note:** Unpublishing makes your portfolio inaccessible but doesn't delete it.

---

## Subdomain Setup

### Choosing a Subdomain

Your subdomain is your unique identifier:
```
https://johndoe.rolerabbit.com
```

**Requirements:**
- 3-63 characters
- Lowercase letters, numbers, hyphens only
- Must start with a letter
- Cannot end with a hyphen

**Tips:**
- Use your name or brand
- Keep it short and memorable
- Avoid numbers if possible

### Setting Your Subdomain

1. Go to **Settings → Domain**
2. Enter desired subdomain
3. Click **"Check Availability"**
4. If available, click **"Save"**

**Common Issues:**

**"Subdomain is taken"**
- Try variations: johndoe → john-doe, jdoe
- Add profession: johndoe-dev, johndoe-design

**"Invalid subdomain format"**
- Check requirements above
- No capital letters
- No special characters except hyphens

### Changing Your Subdomain

1. Go to **Settings → Domain**
2. Click **"Change Subdomain"**
3. Enter new subdomain
4. Click **"Update"**

**⚠️ Warning:** Changing your subdomain will break existing links!

---

## Custom Domain Setup

### Prerequisites

- Own a domain (e.g., johndoe.com)
- Access to DNS settings

### Step-by-Step Setup

#### 1. Add Custom Domain

1. Go to **Settings → Custom Domain**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., www.johndoe.com)
4. Click **"Add Domain"**

#### 2. Configure DNS

You'll see DNS records to add:

**For www.johndoe.com:**
```
Type: CNAME
Name: www
Value: cname.rolerabbit.com
```

**For johndoe.com (apex domain):**
```
Type: A
Name: @
Value: 76.76.21.21

Type: A
Name: @
Value: 76.76.21.22
```

#### 3. Add DNS Records

**Cloudflare:**
1. Log in to Cloudflare
2. Select your domain
3. Go to DNS → Records
4. Click **"Add Record"**
5. Enter Type, Name, Content
6. **Important:** Turn OFF Orange Cloud (set to DNS only)
7. Click **"Save"**

**GoDaddy:**
1. Log in to GoDaddy
2. Go to My Products → DNS
3. Click **"Add"**
4. Select record type
5. Enter Host and Points to
6. Click **"Save"**

**Namecheap:**
1. Log in to Namecheap
2. Domain List → Manage → Advanced DNS
3. Click **"Add New Record"**
4. Enter Type, Host, Value
5. Click **"Save Changes"**

#### 4. Verify Domain

1. Go back to RoleRabbit
2. Click **"Verify Domain"**
3. Wait for verification (can take up to 48 hours)

**Status Indicators:**
- 🟡 **Pending**: DNS propagation in progress
- 🟢 **Verified**: Domain verified successfully
- 🔴 **Failed**: DNS records incorrect

#### 5. SSL Certificate

Once verified, SSL certificate is automatically issued:

- **Status**: SSL Pending → SSL Active
- **Time**: 10-30 minutes
- **Result**: Your site will be accessible via HTTPS

### Troubleshooting Custom Domain

#### Domain Not Verifying

**Check DNS Records:**
```bash
# On macOS/Linux
dig www.johndoe.com CNAME
dig johndoe.com A

# On Windows
nslookup www.johndoe.com
```

Expected output:
```
www.johndoe.com.  300  IN  CNAME  cname.rolerabbit.com.
johndoe.com.      300  IN  A      76.76.21.21
```

**Common Issues:**
- DNS records not added
- Orange cloud enabled on Cloudflare (should be gray)
- TTL too high (set to Auto or 300)
- Old DNS cache (wait 24-48 hours)

#### SSL Not Issuing

**Possible Causes:**
- Domain not verified yet
- CAA records blocking SSL
- Too many SSL requests (rate limited)

**Solution:**
- Ensure domain is verified first
- Check CAA records: `dig johndoe.com CAA`
- Wait 1 hour and try again

#### Site Not Loading

**Check:**
1. Domain is verified ✅
2. SSL is active ✅
3. DNS records are correct ✅
4. Portfolio is published ✅

**Test DNS:**
```bash
curl -I https://www.johndoe.com
```

Should return `200 OK`

---

## Analytics & Insights

### Viewing Analytics

1. Go to **Analytics** tab
2. Select portfolio
3. Choose time period (7d, 30d, 90d, All)

### Metrics Tracked

**Overview:**
- Total Views
- Unique Visitors
- Clicks
- Shares

**Traffic Sources:**
- Direct
- Search Engines
- Social Media
- Referrals

**Geographic:**
- Top Countries
- Top Cities

**Device:**
- Desktop vs Mobile
- Browser breakdown
- Operating System

### Privacy

All analytics are anonymized:
- IP addresses are hashed
- No personal data stored
- GDPR compliant
- Users can opt-out

---

## Sharing Your Portfolio

### Share Link

1. Click **"Share"** button
2. Copy link
3. Share via email, social media, etc.

### Protected Sharing

Create password-protected share links:

1. Click **"Share" → "Create Protected Link"**
2. Set password
3. Set expiration (optional)
4. Set view limit (optional)
5. Click **"Create Link"**

**Use Cases:**
- Share with recruiters only
- Temporary access for clients
- Limited preview before publishing

### Export Portfolio

Download your portfolio:

1. Go to **Settings → Export**
2. Choose format:
   - **PDF**: For printing/emailing
   - **HTML**: Standalone website
   - **JSON**: Raw data
3. Click **"Export"**

---

## FAQs

### General

**Q: Is RoleRabbit free?**
A: Yes! RoleRabbit offers a free tier with all essential features. Premium templates and advanced features require a paid plan.

**Q: Can I create multiple portfolios?**
A: Yes, you can create unlimited portfolios on all plans.

**Q: Can I delete my portfolio?**
A: Yes. Go to Settings → Delete Portfolio. There's a 30-day grace period before permanent deletion.

### Publishing

**Q: Why is my portfolio not published?**
A: Check:
- Portfolio status is "Published" (not Draft)
- All required sections are filled
- No content moderation issues

**Q: How long does it take to publish?**
A: Instantly! Your portfolio is live as soon as you click "Publish".

**Q: Can I unpublish temporarily?**
A: Yes. Click "Unpublish" in settings. You can republish anytime.

### Domains

**Q: Can I use my own domain?**
A: Yes! See [Custom Domain Setup](#custom-domain-setup).

**Q: Do I need a paid plan for custom domains?**
A: Yes, custom domains require a Pro plan.

**Q: Can I change my subdomain later?**
A: Yes, but existing links will break. Update links where you've shared your portfolio.

### Customization

**Q: Can I add custom CSS?**
A: Premium plan users can add custom CSS in Theme → Advanced.

**Q: Can I use my own template?**
A: Not yet. We're working on custom template support!

**Q: How many sections can I add?**
A: Unlimited! Add as many sections as you need.

### Privacy & Security

**Q: Who can see my portfolio?**
A:
- **Public**: Anyone with the link
- **Unlisted**: Anyone with the link (not in search results)
- **Private**: Only people with password

**Q: Can I delete my data?**
A: Yes. Go to Settings → Privacy → Delete Account. All data will be permanently deleted after 30 days.

**Q: Is my data secure?**
A: Yes! We use industry-standard encryption and security practices. See our [Privacy Policy](https://rolerabbit.com/privacy).

### Support

**Q: How do I get help?**
A:
- Check this user guide
- Visit [Help Center](https://help.rolerabbit.com)
- Email support@rolerabbit.com
- Live chat (bottom right corner)

**Q: How fast do you respond to support requests?**
A:
- Email: Within 24 hours
- Live chat: Usually within 1 hour
- Premium users: Priority support

**Q: Can I request features?**
A: Absolutely! Email ideas@rolerabbit.com or use the feedback button in the app.

---

## Tips for Success

### Content

✅ **Be Concise**: Use bullet points, short paragraphs
✅ **Quantify**: Use numbers to show impact
✅ **Show, Don't Tell**: Include projects, demos, links
✅ **Update Regularly**: Keep content fresh

### Design

✅ **Less is More**: Don't overdesign
✅ **Consistent Branding**: Use consistent colors/fonts
✅ **Mobile-First**: Most visitors will be on mobile
✅ **Fast Loading**: Optimize images

### SEO

✅ **Use Keywords**: Include relevant job titles, skills
✅ **Set Meta Tags**: Fill in SEO title and description
✅ **Add Alt Text**: Describe all images
✅ **Use Headings**: Organize content with H1, H2, H3

### Networking

✅ **Share Widely**: LinkedIn, Twitter, email signature
✅ **Track Analytics**: See what's working
✅ **Engage**: Respond to messages quickly
✅ **Update Links**: Keep external links current

---

## Need More Help?

📧 **Email**: support@rolerabbit.com
💬 **Live Chat**: Click chat icon (bottom right)
📚 **Help Center**: https://help.rolerabbit.com
🐦 **Twitter**: @rolerabbit
📺 **Video Tutorials**: https://youtube.com/rolerabbit

---

**Last Updated:** January 15, 2025
