-- Umoja Terra Initial Seed Data

-- 1. Default Users (Admin & Investor)
INSERT OR REPLACE INTO users (id, name, email, phone, location, avatar, role, role_title, password, is_suspended, is_approved, currency, bio, member_since)
VALUES 
(
  'usr-admin-001',
  'Victoria Adeleke',
  'admin@umojaterra.com',
  '+234 802 111 9900',
  'Headquarters, Victoria Island, Lagos',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'admin',
  'Chief Platform Director & Super Admin',
  'admin',
  0,
  1,
  'NGN',
  'Platform Administrator overseeing services catalog, plot verification approvals, and institutional escrow security.',
  'March 2024'
),
(
  'usr-001',
  'Jonathan K.',
  'jonathan.k@umoja.com',
  '+234 812 345 6789',
  'Lekki Phase 1, Lagos',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'user',
  'Verified Investor & Landlord',
  'umoja',
  0,
  1,
  'NGN',
  'Private real estate investor looking for prime dry land in Lagos and residential rental developments.',
  'January 2025'
);

-- 2. Default User-Posted Listings
INSERT OR REPLACE INTO listings (
  id, category_type, title, type, listing_type, location, price, price_period, 
  plot_size, topography, title_type, zoning, beacon_number, bedrooms, bathrooms, furnishing, 
  amenities_json, images_json, image, video_url, description, contact_phone, 
  posted_by, posted_by_role, status, suspension_reason, views_count, inquiries_count, date_posted
) VALUES 
(
  'listing-01',
  'apartment',
  'Executive 3-Bedroom Luxury Apartment',
  'Apartment',
  'For Rent',
  'Freedom Way, Lekki Phase 1, Lagos',
  9500000,
  'year',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  3,
  3.5,
  'Semi-Furnished',
  '["24/7 Electricity", "Treated Water", "Uniformed Security", "Swimming Pool", "Dedicated Parking"]',
  '["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"]',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-living-room-41551-large.mp4',
  'Impeccable serviced 3-bedroom flat on the 2nd floor with elevator access, fitted Italian kitchen, and scenic city views. 24-hour backup generator power guaranteed.',
  '+234 812 345 6789',
  'Jonathan K.',
  'Verified Investor & Landlord',
  'Active',
  NULL,
  142,
  2,
  '3 days ago'
),
(
  'listing-02',
  'plot',
  'Prime 600 SQM Dry Residential Plot',
  'Land Plot',
  'For Sale',
  'Alaro City Corridor, Epe Expressway, Lagos',
  24500000,
  'total',
  '600 SQM (Full Dry Tableland)',
  '100% Dry Tableland',
  'Governor''s Consent & Registered Survey',
  'Residential',
  'LA/EP/2026/102',
  NULL,
  NULL,
  NULL,
  '[]',
  '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80"]',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-and-buildings-4672-large.mp4',
  '100% dry tableland with perimeter beacons and cleared access road. Spotless cadastral file at Alausa Lands Bureau with zero excision disputes. Ready for immediate construction.',
  '+234 812 345 6789',
  'Jonathan K.',
  'Verified Investor & Landlord',
  'Active',
  NULL,
  98,
  1,
  '1 day ago'
),
(
  'listing-pending-01',
  'apartment',
  'Green Park 2-Bedroom Serviced Terrace',
  'Terrace House',
  'For Rent',
  'Orchid Road, Lekki Conservation Corridor, Lagos',
  5500000,
  'year',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  2,
  2,
  'Fully Furnished',
  '["24/7 Power", "Swimming Pool", "CCTV Security", "Dedicated Parking"]',
  '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"]',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  NULL,
  'Contemporary 2-bedroom furnished terrace apartment with fully fitted smart kitchen, dedicated power inverter, and private courtyard.',
  '+234 803 444 8811',
  'Chief Olatunji M.',
  'Landlord & Developer',
  'Pending',
  NULL,
  0,
  0,
  '2 hours ago'
),
(
  'listing-pending-02',
  'plot',
  'Ibeju-Lekki Coastal Front 800 SQM Plot',
  'Land Plot',
  'For Sale',
  'Coastal Road Extension, Ibeju-Lekki, Lagos',
  38000000,
  'total',
  '800 SQM (Coastal Tableland)',
  'Dry Sandy Tableland',
  'Certificate of Occupancy (C of O)',
  'Mixed Residential & Commercial',
  'LA/IBJ/2026/044',
  NULL,
  NULL,
  NULL,
  '[]',
  '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80"]',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  NULL,
  '800 SQM prime parcel facing the ongoing Coastal Highway link. Ideal for commercial boutique hotel or waterfront luxury duplex.',
  '+234 805 777 2200',
  'Dr. Kelechi Nwosu',
  'Plot Owner Trustee',
  'Pending',
  NULL,
  0,
  0,
  '5 hours ago'
),
(
  'listing-suspended-01',
  'plot',
  'Subdivided Lekki Phase 2 Corner Plot',
  'Land Plot',
  'For Sale',
  'Lekki Phase 2, Ikate Axis, Lagos',
  29000000,
  'total',
  '500 SQM',
  'Partially Cleared',
  'Family Deed of Conveyance',
  'Residential',
  'UNVERIFIED-09',
  NULL,
  NULL,
  NULL,
  '[]',
  '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"]',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  NULL,
  'Corner plot located off the primary arterial road without excision clearance.',
  '+234 802 999 1100',
  'Adeyemi Properties Ltd',
  'Commercial Agent',
  'Suspended',
  'Cadastral search flag: Boundary overlap with neighboring Lagos State road acquisition reservation. Requires surveyor re-certification.',
  45,
  0,
  '1 week ago'
);

-- 3. Default Services Catalog
INSERT OR REPLACE INTO services (
  id, title, short_desc, category, tag, hero_image, kind, accent_color, text_color, subtitle_color, badge_color, 
  layout_style, hero_headline, hero_subtitle, badge_text, cta_label, highlights_json, status
) VALUES 
(
  'property-management',
  'Property & Estate Management',
  'End-to-end facility management, tenant screening, automated rent remittance, and maintenance supervision.',
  'Management & Operations',
  'Operations',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
  'service',
  '#1A3E26',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Institutional Real Estate & Asset Care',
  'Complete hands-off peace of mind for diaspora investors, single-unit landlords, and residential gated communities.',
  'Verified Operations',
  'Select Management Plan',
  '["Automated tenant rent collections with zero confrontation", "Quarterly physical 4K photographic inspection reports", "24/7 emergency artisan dispatch with pre-negotiated labor rates", "Digital legal leases drafted by accredited SAN property attorneys"]',
  'active'
),
(
  'land-verification',
  'Land Verification & Title Search',
  'Satellite coordinate surveying, Alausa Lands Bureau charting, excision verification, and official legal clearance.',
  'Legal & Due Diligence',
  'Accredited',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
  'service',
  '#D27D2D',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Accredited Land Verification Passes',
  'Eliminate excision fraud, boundary disputes, and fake C of O risks before paying any land seller.',
  'NIS Licensed Surveyors',
  'Book Verification Pass',
  '["Dual-frequency GNSS RTK satellite boundary coordinate confirmation", "Surveyor General Alausa / AGIS cadastral charting check", "Official written legal opinion signed by certified property solicitor"]',
  'active'
),
(
  'legal-documentation',
  'Legal Conveyancing & Documentation',
  'Fixed-price Deed of Assignment, Contract of Sale, Power of Attorney drafting, and Governor''s Consent filing.',
  'Legal & Due Diligence',
  'Bar Certified',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  'service',
  '#1A3E26',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Fixed-Price Property Conveyancing & Title Perfection',
  'Direct access to senior property advocates and Nigerian Bar Association (NBA) conveyancing specialists.',
  'NBA Accredited Solicitors',
  'Retain Legal Counsel',
  '["Zero hidden lawyer percentages or inflated legal fees", "Legally binding escrow documentation protecting buyer funds", "Governor''s Consent and Stamp Duty processing tracking"]',
  'active'
),
(
  'home-services',
  'Home Services & Artisan On-Demand',
  'Pre-vetted electricians, licensed plumbers, HVAC technicians, and painters with 2-hour emergency dispatch.',
  'Maintenance & Care',
  'On-Demand',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
  'service',
  '#0F172A',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Verified Home Maintenance & Artisan Subscriptions',
  'Never scramble for untrusted artisans. Pre-vetted plumbers, electricians, and HVAC engineers on monthly retainer.',
  'Pre-Vetted Artisans',
  'Choose Maintenance Plan',
  '["Guaranteed 2-hour response time for emergency plumbing and power leaks", "Zero contractor markup on genuine replacement parts", "All artisans background-checked with insured labor guarantee"]',
  'active'
),
(
  'interior-finishing',
  'Interior Finishing & Turnkey Staging',
  'Photorealistic 3D visualization, curated materials procurement, custom joinery, and luxury Airbnb furnishing.',
  'Design & Architecture',
  'Turnkey',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
  'service',
  '#9A3412',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Architectural Interior Design & Staging Subscriptions',
  'From single-room 3D concepts to full turnkey luxury staging for Airbnb and diaspora homes.',
  'Curated Finishes',
  'Book Design Package',
  '["1:1 Before & After spatial visualizers and photorealistic 3D renders", "Direct factory procurement discounts on imported Italian tiles and sanitaryware", "White-glove delivery, assembly, and turnkey staging"]',
  'active'
),
(
  'building-material',
  'Direct-from-Factory Building Materials',
  'Certified 50kg cement, 16mm/12mm high-yield TMT rebar, sharp sand, granite, and interlocking pavers shipped site-direct.',
  'Construction Materials',
  'Wholesale',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
  'product',
  '#1A3E26',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Direct Factory-Gate Material Supply Memberships',
  'Guaranteed genuine Dangote/BUA cement, certified TMT high-yield rebar, and granite shipped straight from depots.',
  'Factory Depot Direct',
  'Join Supply Network',
  '["Eliminate compromised fake rebar and sub-standard hollow block risks", "Flatbed 30-ton trailer direct dispatch with digital weighbridge receipts", "Escrow payment settlement upon verified site delivery"]',
  'active'
),
(
  'moving-services',
  'Insured Moving & Fleet Relocation',
  'Heavy-duty haulage box trucks, certified packing crews, Goods-in-Transit insurance, and inter-state logistics.',
  'Logistics & Relocation',
  'Insured',
  'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1200&q=80',
  'service',
  '#0F172A',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Insured Relocation & Fleet Dispatch Packages',
  'Safe, stress-free home and office relocations with live GPS tracking and Goods-In-Transit insurance.',
  'Goods-In-Transit Insured',
  'Book Relocation Fleet',
  '["Trained packing crew with heavy-duty bubble wrap and corner guards", "Sealed weatherproof haulage trucks with hydraulic tail-lifts", "Zero damage guarantee backed by institutional insurance"]',
  'active'
),
(
  'smart-home',
  'Smart Home & Solar Integration',
  'Biometric digital deadbolts, AI perimeter CCTV cameras, smart touch glass switches, and solar inverter sync.',
  'Technology & Solar',
  'Smart Living',
  'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80',
  'service',
  '#0369A1',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Smart Automation & Solar Hybrid Integration',
  'Elevate your property with biometric access, remote CCTV surveillance, and intelligent solar load balancing.',
  'Certified Smart Integrators',
  'Order Smart Package',
  '["Biometric fingerprint and smartphone remote door locking", "AI security cameras with perimeter motion tripwires and human recognition", "Intelligent inverter energy management saving up to 40% battery capacity"]',
  'active'
),
(
  'financing',
  'Real Estate Financing & Escrow Advisory',
  'Mortgage pre-qualification, 24-60 month developer milestone installment plans, and diaspora foreign exchange protection.',
  'Financing & Advisory',
  'Institutional',
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&q=80',
  'service',
  '#047857',
  '#FFFFFF',
  'rgba(255, 255, 255, 0.85)',
  '#D4AF37',
  'card-modern',
  'Real Estate Financing & Installment Advisory',
  'Navigate mortgage qualification, flexible developer milestone payments, and diaspora currency exchange safely.',
  'Accredited Financial Advisory',
  'Book Finance Session',
  '["Transparent interest rate and hidden fee audits on bank mortgages", "Structured 24 to 60-month direct developer payment plans", "Foreign exchange escrow safeguards for diaspora buyers"]',
  'active'
);

-- 4. Default Subscriptions Tiers
INSERT OR REPLACE INTO subscriptions (id, service_id, name, badge, price_ngn, price_usd, billing_period, short_desc, offerings_json, active, highlighted, sort_order)
VALUES 
-- Property Management
('plan-pm-basic', 'property-management', 'Basic Rent Collection & Tenant Ops', 'Single Landlord', 45000, 30, 'unit/month', 'Ideal for independent landlords with 1 to 5 rental properties.', '["Direct tenant bank debit & multi-channel payment gateway", "Digital legally binding lease agreements with e-signatures", "Automated WhatsApp & email payment reminders", "Quarterly PDF financial yield and expense statements"]', 1, 0, 1),
('plan-pm-comprehensive', 'property-management', 'Comprehensive Landlord Asset Care', 'Most Popular', 75000, 50, 'unit/month', 'Hands-off peace of mind with complete tenant management and maintenance dispatch.', '["All features from Basic Tier", "24/7 emergency hotline & artisan dispatch for plumbing and power", "Quarterly physical walk-through with 4K photo condition reports", "Tenant KYC vetting, BVN checks & guarantor authentications", "Pre-paid utility meter reconciliation to prevent tenant debt"]', 1, 1, 2),
('plan-pm-diaspora', 'property-management', 'Turnkey Diaspora Asset Care', 'VIP Protection', 95000, 64, 'unit/month', 'Tailored for property owners living in the UK, USA, Canada, and Europe.', '["All features from Comprehensive Tier", "Direct overseas rent remittance in USD, GBP, or EUR", "Legal tenancy dispute arbitration and eviction defense insurance", "Automated property re-listing and staging 45 days before vacancy", "Annual property valuation and capital appreciation audit"]', 1, 0, 3),

-- Land Verification
('plan-lv-basic', 'land-verification', 'Fast-Track GPS Boundary & Beacon Pass', 'Preliminary Check', 85000, 55, 'one-time pass', 'Quick on-site verification of beacons and physical topography.', '["On-site physical inspection by licensed NIS surveyor", "Dual-frequency GNSS RTK satellite beacon coordinates check", "4K aerial drone photo and perimeter contour inspection", "48-hour turn-around certificate"]', 1, 0, 1),
('plan-lv-standard', 'land-verification', 'Comprehensive Title & Registry Clearance', 'Most Popular', 195000, 125, 'one-time pass', 'Full cadastral search to ensure zero government acquisition or dispute.', '["All features of Fast-Track Pass", "Physical file search at State Lands Bureau (Alausa / AGIS)", "Charting check against government committed acquisitions", "Official Certificate of Occupancy & Excision status check", "Written legal clearance certificate signed by SAN counsel"]', 1, 1, 2),
('plan-lv-deep', 'land-verification', 'Full Institutional Due Diligence Pass', 'Total Security', 380000, 245, 'one-time pass', 'Deep vetting including family lineage, court records, and physical beacon planting.', '["All features of Comprehensive Clearance", "In-person community elder & Omo-Onile chieftaincy tree interview", "Litigation check across High Court and Court of Appeal dockets", "Soil test & swamp foundation elevation survey", "Umoja Terra 100% Escrow Acquisition Backing"]', 1, 0, 3),

-- Legal Documentation
('plan-leg-search', 'legal-documentation', 'Deed & Title Registry Search Report', 'Quick Vetting', 65000, 42, 'per search', 'Independent review of title documents and land registry files.', '["Registry search at State Land Bureau", "Verification of power of attorney & letters of administration", "Written legal advisory memorandum highlighting red flags"]', 1, 0, 1),
('plan-leg-draft', 'legal-documentation', 'Deed of Assignment & Contract Drafting', 'Most Popular', 150000, 95, 'per contract', 'Comprehensive custom agreements protecting buyer rights and warranties.', '["Drafting of airtight Deed of Assignment & Contract of Sale", "Indemnity and seller breach warranty clauses", "Remote video witnessing or in-person execution signing", "Official stamping guidelines pack"]', 1, 1, 2),
('plan-leg-consent', 'legal-documentation', 'Governor''s Consent & Title Perfection Retainer', 'Full Perfection', 320000, 200, 'per title', 'Professional liaison to secure Governor''s Consent and registered title.', '["Preparation and filing of Form 1C at Ministry of Lands", "Assessment fee reconciliation and capital gains tax advisory", "Direct follow-up through all stages of approval", "Handover of sealed registered title deed"]', 1, 0, 3),

-- Home Services
('plan-hs-essential', 'home-services', 'Essential Home Maintenance Retainer', 'Standard Home', 25000, 16, 'monthly', 'Proactive upkeep for 2-3 bedroom residential apartments.', '["Monthly plumbing inspection & water pressure test", "Air conditioning filter clean and gas top-up audit", "Electrical DB breaker & inverter load check", "2 free artisan emergency call-outs per month"]', 1, 0, 1),
('plan-hs-pro', 'home-services', 'Complete Home & Artisan Care Plan', 'Most Popular', 55000, 35, 'monthly', 'Full coverage for duplexes and luxury residential properties.', '["All Essential Care features included", "Unlimited artisan callouts (Plumbing, Electrical, Carpentry)", "Bi-monthly exterior high-pressure washing of driveway & drains", "Solar inverter & lithium battery cell maintenance check", "Priority 1-hour emergency artisan dispatch"]', 1, 1, 2),

-- Interior Finishing
('plan-int-consult', 'interior-finishing', 'Concept & 3D Spatial Blueprint', 'Design Concept', 120000, 78, 'per room', 'Full 3D visualization and furniture schedule before purchasing materials.', '["1-on-1 interior architect video consultation", "4K photorealistic 3D room renders from 4 angles", "Curated paint, tile, and lighting specification sheet", "Procurement shopping list with discounted trade prices"]', 1, 0, 1),
('plan-int-turnkey', 'interior-finishing', 'Turnkey Renovation & Installation Retainer', 'Most Popular', 350000, 220, 'per project', 'Hands-off design execution supervised on site by licensed architects.', '["All 3D Spatial Blueprint features included", "Dedicated site project architect overseeing tile & joinery installation", "Custom fluted wall paneling and acoustic ceiling integration", "Factory delivery coordination and quality inspection sign-off"]', 1, 1, 2),

-- Building Material
('plan-bm-retail', 'building-material', 'Private Homebuilder Supply Pass', 'Individual Builder', 20000, 13, 'annual access', 'Direct wholesale rates on cement, sand, and granite for private home builders.', '["Guaranteed factory-gate cement and rebar prices", "On-site delivery within 24 to 48 hours across major corridors", "Escrow payment release only after you inspect delivered materials"]', 1, 0, 1),
('plan-bm-developer', 'building-material', 'Contractor & Estate Wholesale Account', 'Most Popular', 90000, 58, 'annual access', 'Priority logistics for contractors, estate developers, and civil engineers.', '["All Private Homebuilder features included", "Priority dispatch of 30-ton flatbed trailers and tippers", "Laboratory tensile strength and slump test certificates provided", "Dedicated logistics account manager"]', 1, 1, 2),

-- Moving Services
('plan-mov-city', 'moving-services', 'Intra-City Apartment Move Pass', 'City Move', 80000, 50, 'per move', 'Smooth apartment relocations within Lagos, Abuja, or Port Harcourt.', '["Sealed 5-ton box truck with 3-person professional packing crew", "Protective furniture blankets and heavy-duty bubble wrapping", "Same-day pickup and delivery with furniture placement at new home"]', 1, 0, 1),
('plan-mov-interstate', 'moving-services', 'Interstate Executive Relocation', 'Most Popular', 250000, 160, 'per move', 'Cross-country relocations between states with real-time GPS tracking.', '["Dedicated 30-ton padded haulage truck with satellite GPS tracking", "Goods-in-Transit insurance coverage up to ₦50 Million", "Full dismantling, secure crating, and reassembly at destination"]', 1, 1, 2),

-- Smart Home
('plan-sh-security', 'smart-home', 'Smart Access & Security Starter', 'Smart Security', 180000, 115, 'installed package', 'Keyless biometric entry and smart doorbell video monitoring.', '["Biometric digital deadbolt smart lock (Fingerprint, Passcode, Card, Key)", "1080p Smart Video Doorbell with 2-way audio and phone chime", "Remote smartphone unlock and temporary visitor code generation", "Professional installation and 1-year hardware warranty"]', 1, 0, 1),
('plan-sh-complete', 'smart-home', 'Full Home Automation & Energy Suite', 'Most Popular', 450000, 290, 'installed package', 'Whole-house smart lighting, motorized blinds, and solar inverter sync.', '["All Smart Security features included", "Smart touch glass wall switches and automated lighting scenes", "Solar inverter & battery monitor with auto-load shedding", "Voice assistant integration (Alexa / Google Home)", "4 Outdoor AI perimeter security cameras with night vision"]', 1, 1, 2),

-- Financing
('plan-fin-prequal', 'financing', 'Mortgage Pre-Qualification & Credit Review', 'Consultation', 45000, 28, 'per session', '1-on-1 financial diagnostic with an accredited real estate finance specialist.', '["Comprehensive debt-to-income and equity capacity analysis", "Multi-bank mortgage rate comparison (NHF vs Commercial Mortgages)", "Official lender pre-qualification recommendation letter"]', 1, 0, 1),
('plan-fin-plan', 'financing', 'Developer Milestone Installment Structuring', 'Most Popular', 120000, 75, 'per plan', 'Airtight payment plan contracts tied directly to verified building milestones.', '["Structuring of 12 to 36-month developer installment contracts", "Milestone-linked escrow release schedule (foundation, lintel, roofing, finishing)", "Inflation and currency adjustment risk clauses protecting buyer capital"]', 1, 1, 2);

-- 5. Default Message Threads
INSERT OR REPLACE INTO message_threads (id, user_id, contact_name, contact_avatar, contact_role, property_title, unread_count, time)
VALUES 
('thread-1', 'usr-001', 'Engr. Babatunde F.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Plot Owner Trustee & Lead Surveyor', 'Atlantic Bayfront Serviced Residential Plot', 1, '18m ago'),
('thread-rent-01', 'usr-001', 'Chief Alhaji Danjuma', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 'Apartment Property Owner', 'Serviced 3-Bedroom Waterfront Apartment', 1, '1 hour ago'),
('thread-house-03', 'usr-001', 'Mrs. Nkiru Utomi', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100', 'Chevron Duplex Owner', 'Oakwood 4-Bedroom Semi-Detached Duplex with BQ', 0, 'Yesterday'),
('thread-2', 'usr-001', 'Dr. Amaka Eze (Interested Tenant)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 'Prospective Tenant Candidate', 'Executive 3-Bedroom Luxury Apartment (Your Listing)', 1, '2 hours ago'),
('thread-plot-inquiry', 'usr-001', 'Chief Emeka Okonkwo (Interested Buyer)', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', 'Commercial Land Investor', 'Prime 600 SQM Dry Residential Plot (Your Listing)', 1, '3 hours ago');

-- Messages for thread-1
INSERT OR REPLACE INTO messages (id, thread_id, sender, text, created_at) VALUES 
('msg-1', 'thread-1', 'other', 'Good day Jonathan! I am the verified trustee & surveyor for the Atlantic Bayfront Plot. I reviewed the coordinate beacon for the Epe corridor plot you liked.', '2026-10-20 10:15:00'),
('msg-2', 'thread-1', 'me', 'Thanks Babatunde. Are the concrete beacons verified with Alausa Lands Bureau?', '2026-10-20 10:20:00'),
('msg-3', 'thread-1', 'other', 'Yes, 100% verified dry tableland with Registered Survey LA/EP/2025/084. I can accompany you for physical boundary pegging anytime this Friday.', '2026-10-20 10:28:00');

-- Messages for thread-rent-01
INSERT OR REPLACE INTO messages (id, thread_id, sender, text, created_at) VALUES 
('msg-d1', 'thread-rent-01', 'other', 'Hello Jonathan, peace be unto you! I am Alhaji Danjuma, the owner of the Serviced 3-Bedroom waterfront flat on Admiralty Way. I saw you showed interest in the apartment.', '2026-10-20 11:20:00'),
('msg-d2', 'thread-rent-01', 'other', 'The lease agreement is ready with 24-hour backup generator power and elevator access. Would you like an official walkthrough inspection this week?', '2026-10-20 11:25:00');

-- Messages for thread-house-03
INSERT OR REPLACE INTO messages (id, thread_id, sender, text, created_at) VALUES 
('msg-u1', 'thread-house-03', 'other', 'Hello Jonathan! Thank you for your interest in our Chevron duplex. The Governor’s Consent is fully stamped and verified.', '2026-10-19 15:10:00'),
('msg-u2', 'thread-house-03', 'me', 'Hello Mrs. Utomi, does the compound accommodate up to 4 SUVs?', '2026-10-19 15:30:00'),
('msg-u3', 'thread-house-03', 'other', 'Yes! The stamped concrete driveway has space for 4 large vehicles, plus dedicated generator housing.', '2026-10-19 15:45:00');

-- Messages for thread-2
INSERT OR REPLACE INTO messages (id, thread_id, sender, text, created_at) VALUES 
('msg-201', 'thread-2', 'other', 'Hello! I saw your posted 3-Bedroom apartment on Umoja Terra. Is it ready for immediate move-in?', '2026-10-20 14:40:00'),
('msg-202', 'thread-2', 'me', 'Hello Dr. Eze, yes it is fully serviced with 24/7 power, treated water, and dedicated parking.', '2026-10-20 15:05:00'),
('msg-203', 'thread-2', 'other', 'Wonderful! Can we schedule a viewing this Saturday morning?', '2026-10-20 15:20:00');

-- Messages for thread-plot-inquiry
INSERT OR REPLACE INTO messages (id, thread_id, sender, text, created_at) VALUES 
('msg-301', 'thread-plot-inquiry', 'other', 'Good day! I saw your posted 600 SQM plot in the Alaro City Corridor. I want to confirm if the survey beacons are planted on site?', '2026-10-20 09:45:00'),
('msg-302', 'thread-plot-inquiry', 'other', 'I am ready to inspect and pay if the title documents match with the surveyor coordinates.', '2026-10-20 09:50:00');

-- 6. Default Notifications
INSERT OR REPLACE INTO notifications (id, user_id, title, message, category, read, time) VALUES 
('notif-1', 'usr-001', 'Inspection Confirmed', 'Your private site inspection for Atlantic Bayfront Plot is scheduled for Friday at 10:00 AM with Surveyor Babatunde.', 'inspection', 0, '35 minutes ago'),
('notif-2', 'usr-001', 'Price Update Alert', 'The 4-Bedroom Semi-Detached Duplex in Chevron Tollgate you showed interest in has an updated payment plan.', 'price', 0, '4 hours ago'),
('notif-3', 'usr-001', 'Title Verification Cleared', 'Cadastral search LA/EP/2025/084 confirmed clean title with zero government excision conflict.', 'legal', 1, 'Yesterday'),
('notif-4', 'usr-001', 'New Inquiry on Your Apartment', 'Dr. Amaka Eze sent a message inquiring about move-in dates for your Lekki Phase 1 Luxury Flat.', 'inquiry', 0, '2 days ago'),
('notif-5', 'usr-001', 'Plot Inquiry Received', 'Chief Emeka Okonkwo messaged you regarding beacon coordinates for your Alaro City Plot.', 'inquiry', 0, '3 hours ago');

-- 7. Default Admin Logs
INSERT OR REPLACE INTO admin_logs (id, action, admin_name) VALUES 
('log-1', 'Cadastral database synced with Lagos State Lands Bureau', 'Victoria Adeleke'),
('log-2', 'Verified and approved listing "Executive 3-Bedroom Luxury Apartment"', 'Victoria Adeleke'),
('log-3', 'Flagged listing "Subdivided Lekki Phase 2 Corner Plot" for title check', 'Victoria Adeleke');

-- 8. Default Countries for Explore Directory
INSERT OR REPLACE INTO countries (id, name, flag, motto, desc, video_url, accent, highlights_json, potential_neighborhoods_json, culture_info_json, is_hidden)
VALUES 
(
  'ng',
  'Nigeria',
  '🇳🇬',
  'Giant of Africa & Dynamic Real Estate Frontier',
  'From luxury prime water-front tableland in Lagos Lekki Corridor to high-yield commercial hubs in Abuja.',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-and-buildings-4672-large.mp4',
  '#1A3E26',
  '["High Capital Growth: 18-35% YoY in Epe & Lekki Free Trade Zone", "Direct title searches verified with Alausa Lands Bureau", "Escrow protected payments with leading Nigerian legal chambers"]',
  '["Epe Lagoon Front", "Alaro City Extension", "Chevron Lekki Phase 2", "Guzape District, Abuja"]',
  '{"currency":"NGN (₦)","capital":"Abuja","population":"220 Million"}',
  0
),
(
  'gh',
  'Ghana',
  '🇬🇭',
  'Gateway to West Africa & Stable Diaspora Haven',
  'Pristine coastal plots, serviced gated residential communities, and modern townhouses in Greater Accra.',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-and-buildings-4672-large.mp4',
  '#D27D2D',
  '["Transparent land titles with Ghana Lands Commission", "Strong diaspora rental demand in Cantonments & Airport Hills", "Stable currency yield & verified stool land documentation"]',
  '["East Legon Hills", "Prampram Beachfront", "Airport Residential Area", "Aburi Mountain Foothills"]',
  '{"currency":"GHS (₵)","capital":"Accra","population":"33 Million"}',
  0
),
(
  'ke',
  'Kenya',
  '🇰🇪',
  'East Africa Tech & Eco-Living Capital',
  'Breathtaking Great Rift Valley view parcels, suburban Nairobi gated estates, and coastal Diani Beach gems.',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-and-buildings-4672-large.mp4',
  '#0F172A',
  '["ArdhiSasa digital land registry instant searches", "Booming serviced plots along Nairobi Expressway corridors", "High tourist vacation home Airbnb occupancy rates"]',
  '["Karen & Runda", "Konza Technopolis Belt", "Diani Coastal Strip", "Naivasha Lake Corridor"]',
  '{"currency":"KES (KSh)","capital":"Nairobi","population":"54 Million"}',
  0
),
(
  'rw',
  'Rwanda',
  '🇷🇼',
  'The Green & Clean Investment Beacon',
  'Master-planned urban plots in Kigali with clean cadastral registries and green eco-district zoning.',
  'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-and-buildings-4672-large.mp4',
  '#0369A1',
  '["100% digital land registration via Rwanda Land Management and Use Authority", "Fastest title transfer in Africa (under 48 hours)", "Rapid capital appreciation in Kigali masterplan sectors"]',
  '["Nyarutarama", "Kagugu Hill", "Rebero Eco-Zone", "Kicukiro Heights"]',
  '{"currency":"RWF","capital":"Kigali","population":"13.5 Million"}',
  0
);
