# user status

STATUS_USER = 'U'
STATUS_SUPERUSER = 'S'
STATUS_VISITOR = 'V'
STATUS_VIP = 'VIP'
USER_STATUS_CHOICES = [
    (STATUS_USER, 'User'),
    (STATUS_SUPERUSER, 'Superuser'),
    (STATUS_VISITOR, 'Visitor'),
    (STATUS_VIP, 'VIP')
]

# availability

AVAILABLE_CHOICE = 'A'
SOLD_CHOICE = 'S'
EXPIRED_CHOICE = 'E'
AVAILABILITY_CHOICES = [
    (AVAILABLE_CHOICE, 'Available'),
    (SOLD_CHOICE, 'Sold'),
    (EXPIRED_CHOICE, 'Expired'),
]


#avatars

BLUE_BLIND_AVATAR = "https://storage.googleapis.com/blue_penguin/default/blue_blind.png"
BLUE_EGG_AVATAR = "https://storage.googleapis.com/blue_penguin/default/blue_egg.png"
GREEN_GLASSES_AVATAR = "https://storage.googleapis.com/blue_penguin/default/green_glasses.png"
GREEN_HAIR_AVATAR = "https://storage.googleapis.com/blue_penguin/default/green_hair.png"
PURPLE_BANDIT_AVATAR = "https://storage.googleapis.com/blue_penguin/default/purple_bandit.png"
PURPLE_EGG_AVATAR = "https://storage.googleapis.com/blue_penguin/default/purple_egg.png"
RED_CROWN_AVATAR = "https://storage.googleapis.com/blue_penguin/default/red_crown.png"
RED_EYEPATCH_AVATAR = "https://storage.googleapis.com/blue_penguin/default/red_eyepatch.png"
YELLOW_GLASSES_AVATAR = "https://storage.googleapis.com/blue_penguin/default/yellow_glasses.png"
YELLOW_HAIR_AVATAR = "https://storage.googleapis.com/blue_penguin/default/yellow_hair.png"

AVATAR_CHOICES = [
        (BLUE_BLIND_AVATAR, 'avatar1'),
        (BLUE_EGG_AVATAR, 'avatar2'),
        (GREEN_GLASSES_AVATAR, 'avatar3'),
        (GREEN_HAIR_AVATAR, 'avatar4'),
        (PURPLE_BANDIT_AVATAR, 'avatar5'),
        (PURPLE_EGG_AVATAR, 'avatar6'),
        (RED_CROWN_AVATAR, 'avatar7'),
        (RED_EYEPATCH_AVATAR, 'avatar8'),
        (YELLOW_GLASSES_AVATAR, 'avatar9'),
        (YELLOW_HAIR_AVATAR, 'avatar10'),
]

# bid status

HIGHEST_CHOICE = '1st'
SECOND_HIGHEST_CHOICE = '2nd'
THIRD_HIGHEST_CHOICE = '3rd'
NOT_HIGHEST_CHOICE = 'F'
BID_STATUS_CHOICES = [
    (HIGHEST_CHOICE, 'Highest Bid'),
    (SECOND_HIGHEST_CHOICE, 'Second Highest Bid'),
    (THIRD_HIGHEST_CHOICE, 'Third Highest Bid'),
    (NOT_HIGHEST_CHOICE, 'Not In the Top Three')
]

# transaction status

PENDING_CHOICE = 'P'
SHIPPED_CHOICE = 'C'
RECEIVED_CHOICE = 'R'
TRANSACTION_STATUS_CHOICES = [
    (PENDING_CHOICE, 'Pending'),
    (SHIPPED_CHOICE, 'Shipped'),
    (RECEIVED_CHOICE, 'Received')
]

# countries

COUNTRY_CHOICES = [
    # North America
    ("United States", "United States"),
    ("Canada", "Canada"),
    ("Mexico", "Mexico"),
    ("Bahamas", "Bahamas"),
    ("Bermuda", "Bermuda"),
    ("Puerto Rico", "Puerto Rico"),
    ("Jamaica", "Jamaica"),
    ("Dominican Republic", "Dominican Republic"),
    ("Haiti", "Haiti"),
    ("Trinidad and Tobago", "Trinidad and Tobago"),
    
    # Central America
    ("Belize", "Belize"),
    ("Costa Rica", "Costa Rica"),
    ("El Salvador", "El Salvador"),
    ("Guatemala", "Guatemala"),
    ("Honduras", "Honduras"),
    ("Nicaragua", "Nicaragua"),
    ("Panama", "Panama"),
    
    # South America
    ("Argentina", "Argentina"),
    ("Bolivia", "Bolivia"),
    ("Brazil", "Brazil"),
    ("Chile", "Chile"),
    ("Colombia", "Colombia"),
    ("Ecuador", "Ecuador"),
    ("Guyana", "Guyana"),
    ("Paraguay", "Paraguay"),
    ("Peru", "Peru"),
    ("Suriname", "Suriname"),
    ("Uruguay", "Uruguay"),
    ("Venezuela", "Venezuela"),
    
    # Europe
    ("United Kingdom", "United Kingdom"),
    ("Ireland", "Ireland"),
    ("France", "France"),
    ("Germany", "Germany"),
    ("Italy", "Italy"),
    ("Spain", "Spain"),
    ("Portugal", "Portugal"),
    ("Belgium", "Belgium"),
    ("Netherlands", "Netherlands"),
    ("Luxembourg", "Luxembourg"),
    ("Switzerland", "Switzerland"),
    ("Austria", "Austria"),
    ("Sweden", "Sweden"),
    ("Norway", "Norway"),
    ("Denmark", "Denmark"),
    ("Finland", "Finland"),
    ("Iceland", "Iceland"),
    ("Poland", "Poland"),
    ("Czech Republic", "Czech Republic"),
    ("Hungary", "Hungary"),
    ("Romania", "Romania"),
    ("Bulgaria", "Bulgaria"),
    ("Greece", "Greece"),
    ("Cyprus", "Cyprus"),
    ("Malta", "Malta"),
    ("Estonia", "Estonia"),
    ("Latvia", "Latvia"),
    ("Lithuania", "Lithuania"),
    ("Slovakia", "Slovakia"),
    ("Slovenia", "Slovenia"),
    ("Croatia", "Croatia"),
    ("Bosnia and Herzegovina", "Bosnia and Herzegovina"),
    ("Serbia", "Serbia"),
    ("Montenegro", "Montenegro"),
    ("North Macedonia", "North Macedonia"),
    ("Albania", "Albania"),
    ("Kosovo", "Kosovo"),
    ("Moldova", "Moldova"),
    ("Ukraine", "Ukraine"),
    
    # Middle East
    ("Palestine", "Palestine"),
    ("Turkey", "Turkey"),
    ("Saudi Arabia", "Saudi Arabia"),
    ("United Arab Emirates", "United Arab Emirates"),
    ("Qatar", "Qatar"),
    ("Kuwait", "Kuwait"),
    ("Oman", "Oman"),
    ("Bahrain", "Bahrain"),
    ("Jordan", "Jordan"),
    ("Lebanon", "Lebanon"),
    ("Iraq", "Iraq"),
    ("Yemen", "Yemen"),
    
    # Africa
    ("South Africa", "South Africa"),
    ("Egypt", "Egypt"),
    ("Nigeria", "Nigeria"),
    ("Kenya", "Kenya"),
    ("Ghana", "Ghana"),
    ("Uganda", "Uganda"),
    ("Morocco", "Morocco"),
    ("Algeria", "Algeria"),
    ("Tunisia", "Tunisia"),
    ("Ivory Coast", "Ivory Coast"),
    ("Senegal", "Senegal"),
    ("Ethiopia", "Ethiopia"),
    ("Tanzania", "Tanzania"),
    ("Zambia", "Zambia"),
    ("Botswana", "Botswana"),
    ("Namibia", "Namibia"),
    ("Mozambique", "Mozambique"),
    ("Zimbabwe", "Zimbabwe"),
    ("Rwanda", "Rwanda"),
    ("Angola", "Angola"),
    
    # Asia
    ("China", "China"),
    ("Japan", "Japan"),
    ("South Korea", "South Korea"),
    ("India", "India"),
    ("Pakistan", "Pakistan"),
    ("Bangladesh", "Bangladesh"),
    ("Indonesia", "Indonesia"),
    ("Malaysia", "Malaysia"),
    ("Singapore", "Singapore"),
    ("Thailand", "Thailand"),
    ("Vietnam", "Vietnam"),
    ("Philippines", "Philippines"),
    ("Sri Lanka", "Sri Lanka"),
    ("Nepal", "Nepal"),
    ("Maldives", "Maldives"),
    ("Bhutan", "Bhutan"),
    ("Myanmar", "Myanmar"),
    ("Cambodia", "Cambodia"),
    ("Laos", "Laos"),
    ("Brunei", "Brunei"),
    ("East Timor", "East Timor"),
    
    # Central Asia
    ("Kazakhstan", "Kazakhstan"),
    ("Uzbekistan", "Uzbekistan"),
    ("Turkmenistan", "Turkmenistan"),
    ("Tajikistan", "Tajikistan"),
    ("Kyrgyzstan", "Kyrgyzstan"),
    
    # Oceania
    ("Australia", "Australia"),
    ("New Zealand", "New Zealand"),
    ("Papua New Guinea", "Papua New Guinea"),
    ("Fiji", "Fiji"),
    ("Samoa", "Samoa"),
    ("Tonga", "Tonga"),
    ("Vanuatu", "Vanuatu"),
    ("Solomon Islands", "Solomon Islands"),
    
    # Additional Territories and Special Administrative Regions
    ("Hong Kong", "Hong Kong"),
    ("Macau", "Macau"),
    ("Taiwan", "Taiwan")
]

# states, provinces, territories

STATE_PROVINCE_CHOICES = [
    ("AL", "Alabama"),
    ("AK", "Alaska"),
    ("AZ", "Arizona"),
    ("AR", "Arkansas"),
    ("CA", "California"),
    ("CO", "Colorado"),
    ("CT", "Connecticut"),
    ("DE", "Delaware"),
    ("FL", "Florida"),
    ("GA", "Georgia"),
    ("HI", "Hawaii"),
    ("ID", "Idaho"),
    ("IL", "Illinois"),
    ("IN", "Indiana"),
    ("IA", "Iowa"),
    ("KS", "Kansas"),
    ("KY", "Kentucky"),
    ("LA", "Louisiana"),
    ("ME", "Maine"),
    ("MD", "Maryland"),
    ("MA", "Massachusetts"),
    ("MI", "Michigan"),
    ("MN", "Minnesota"),
    ("MS", "Mississippi"),
    ("MO", "Missouri"),
    ("MT", "Montana"),
    ("NE", "Nebraska"),
    ("NV", "Nevada"),
    ("NH", "New Hampshire"),
    ("NJ", "New Jersey"),
    ("NM", "New Mexico"),
    ("NY", "New York"),
    ("NC", "North Carolina"),
    ("ND", "North Dakota"),
    ("OH", "Ohio"),
    ("OK", "Oklahoma"),
    ("OR", "Oregon"),
    ("PA", "Pennsylvania"),
    ("RI", "Rhode Island"),
    ("SC", "South Carolina"),
    ("SD", "South Dakota"),
    ("TN", "Tennessee"),
    ("TX", "Texas"),
    ("UT", "Utah"),
    ("VT", "Vermont"),
    ("VA", "Virginia"),
    ("WA", "Washington"),
    ("WV", "West Virginia"),
    ("WI", "Wisconsin"),
    ("WY", "Wyoming"),
    ("AB", "Alberta"),
    ("BC", "British Columbia"),
    ("MB", "Manitoba"),
    ("NB", "New Brunswick"),
    ("NL", "Newfoundland and Labrador"),
    ("NS", "Nova Scotia"),
    ("ON", "Ontario"),
    ("PE", "Prince Edward Island"),
    ("QC", "Quebec"),
    ("SK", "Saskatchewan"),
    ("NT", "Northwest Territories"),
    ("NU", "Nunavut"),
    ("YT", "Yukon"),
]

