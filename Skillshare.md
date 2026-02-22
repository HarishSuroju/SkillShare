
📲 SkillShare
WhatsApp-Based Local Service Marketplace
1. Executive Summary

SkillShare is a WhatsApp-first hyperlocal service marketplace that connects customers with nearby service providers such as electricians, plumbers, tutors, mechanics, cleaners, carpenters, and more.

Unlike traditional app-based platforms, SkillShare operates directly via the WhatsApp Business Cloud API, eliminating app download friction and making it highly accessible for rural and semi-urban India.

The platform aims to empower local workers while providing trusted, fast, and transparent service discovery for customers.

2. Problem Statement
Current Challenges

❌ No structured service marketplace in rural areas

❌ Low digital literacy among workers

❌ App download barrier

❌ Informal booking system

❌ No transparent ratings

❌ Heavy dependence on word-of-mouth

❌ Lack of verified providers

3. Proposed Solution

SkillShare provides:

📍 Location-based service matching

⭐ Ratings and reviews

📲 Booking directly via WhatsApp

💰 UPI-based payment links

🎙 Voice message support

🌐 Multi-language support (future phase)

📊 Admin monitoring dashboard

4. Why WhatsApp?

500M+ users in India

~85% rural penetration

High daily engagement

Trusted communication platform

Voice support for low-literacy users

Low data consumption

WhatsApp removes the need for app downloads and works even on low-end smartphones.

5. Target Market
Primary Users

Rural households

Tier-2 & Tier-3 city residents

Semi-digital service providers

Service Categories

Plumbing

Electrical

AC Repair

Cleaning

Carpentry

Tutoring

Vehicle Repair

Agriculture Support

6. Core Features
Customer Features

Share live location

Browse nearby providers

Compare ratings

Instant booking

Booking status tracking

Submit ratings & reviews

Pay using UPI link

Provider Features

Register via WhatsApp

Add service details

Set availability

Accept/reject bookings

View performance metrics

Access basic web dashboard

Admin Features

Monitor bookings

Verify providers

Fraud detection

Revenue tracking

Analytics dashboard

7. Smart Matching Algorithm

Instead of basic radius filtering, SkillShare uses a weighted scoring system.

Matching Formula
Score =
  (0.4 × Distance Score)
+ (0.3 × Rating Score)
+ (0.2 × Completion Rate)
+ (0.1 × Response Speed)

Implementation Approach

Use MongoDB Geo Queries for distance filtering

Normalize all parameters between 0–1

Use Min-Heap / Priority Queue for sorting

Return top 5 providers

This creates a competitive advantage over simple listing-based platforms.

8. Technical Architecture
User (WhatsApp)
        ↓
WhatsApp Business Cloud API
        ↓
Webhook Server (Node.js + Express)
        ↓
Business Logic Layer
        ↓
MongoDB (Geo Indexed)
        ↓
Google Maps API
        ↓
Payment (UPI Link)

9. Technology Stack
Layer	Technology
Messaging	WhatsApp Business Cloud API
Backend	Node.js + Express
Database	MongoDB Atlas
Hosting	Render / AWS
Location	Google Maps API
Dashboard	React
Future Cache	Redis
10. Database Schema
Providers Collection
{
  "_id": "ObjectId",
  "whatsappNumber": "String",
  "name": "String",
  "serviceType": "String",
  "location": {
    "type": "Point",
    "coordinates": [lng, lat]
  },
  "rating": 4.5,
  "totalReviews": 100,
  "responseTimeAvg": 15,
  "completionRate": 0.92,
  "verificationStatus": "verified",
  "serviceRadius": 5,
  "languagesSpoken": ["Hindi", "Telugu"],
  "isActive": true,
  "createdAt": "Date"
}

Services Collection
{
  "_id": "ObjectId",
  "providerId": "ObjectId",
  "serviceName": "AC Repair",
  "description": "Home AC installation and repair",
  "basePrice": 500,
  "duration": 60,
  "isActive": true
}

Bookings Collection
{
  "_id": "ObjectId",
  "customerNumber": "String",
  "providerId": "ObjectId",
  "serviceId": "ObjectId",
  "status": "pending",
  "paymentStatus": "unpaid",
  "platformCommission": 50,
  "bookingDate": "Date",
  "rating": 5,
  "review": "Excellent service"
}

11. Conversation Flow
Welcome Message
Hello 👋 Welcome to SkillShare!

Send your location to find nearby services.

Or type:
1 - View Services
2 - Register as Provider
3 - Help

Booking Flow

Customer shares location

Bot fetches nearby providers

Top 5 providers displayed

Customer selects provider

Booking confirmation

Provider notified

Service completed

Rating collected

12. Development Roadmap
Phase 1 – MVP (1 Week)

WhatsApp API setup

Provider registration

Geo-based search

Basic booking flow

Phase 2 – Enhancement

Smart matching algorithm

Rating system

Admin dashboard

Phase 3 – Scale

Integrated payments

Fraud detection system

Demand prediction

Micro-financing partnerships

13. Revenue Model
Phase 1

Free onboarding

No commission

Phase 2

5–10% commission per booking

Featured provider listings

Subscription model

Phase 3

Insurance partnerships

Tool financing

Local advertisements

Micro-loans

14. Risks & Mitigation
WhatsApp API Approval

Use Cloud Sandbox for development

Prepare strong business use case

Provider Fraud

Multi-step verification

Community-based ratings

Payment Disputes

Start with UPI links

Introduce escrow model later

15. Budget Estimation
MVP Cost
Item	Cost
Developer	₹25,000
Hosting	₹2,000
API	₹1,000
Domain	₹500

Total: ₹28,500

Using free tiers → Under ₹5,000 possible.

16. Success Metrics
User Metrics

Daily Active Users

Booking Conversion Rate

Retention Rate

Message Engagement

Business Metrics

Revenue per booking

Provider acquisition rate

Customer satisfaction rating

Platform commission growth

17. Competitive Advantage
Feature	SkillShare	Traditional Apps
App Download	❌ No	✅ Required
Rural Friendly	✅ Yes	Limited
Voice Support	✅ Yes	Limited
Low Data Usage	✅ Yes	Moderate
Trust Level	High	Medium
18. Long-Term Vision

SkillShare aims to become:

A WhatsApp-native Urban Company

Rural service infrastructure layer

Financial empowerment platform

Hyperlocal service ecosystem

Vision Statement

“SkillShare aims to empower local workers and simplify service discovery in India by leveraging the most widely used communication platform — WhatsApp.”



====================================================================================================================================


How WhatsApp Cloud API Works
----------------------------

Flow:

1. User sends message to your WhatsApp Business number

2. Meta sends message to your webhook

3. Your backend processes it

4. Your backend calls WhatsApp API to reply