from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

# Using the validated settings from config.py 
# This connects to your specific Atlas cluster: cluster0.4baxit3.mongodb.net
client = AsyncIOMotorClient(settings.MONGODB_URI)
database = client[settings.DB_NAME]

# Collections for your Evaluation Components
user_collection = database.get_collection("users")
file_collection = database.get_collection("files")

async def init_db():
    try:
        # Verify connection
        await client.admin.command('ping')
        
        # [Component 2: Access Control/Expiry]
        # Create a TTL index to automatically delete expired files
        # This enforces your 'Access Expiry' policy at the database level
        await file_collection.create_index("expiry_at", expireAfterSeconds=0)
        
        # Create the main admin user if not exists
        await create_main_admin()
        
        print(f"Successfully connected to MongoDB Atlas: {settings.DB_NAME}")
    except Exception as e:
        print(f"Database connection failed: {e}")

async def create_main_admin():
    """
    Create the main admin user: Raju with password Raju@2006
    This user has full access (Admin role)
    """
    import bcrypt
    import pyotp
    
    # Check if admin already exists
    existing_admin = await user_collection.find_one({"username": "Raju"})
    
    if not existing_admin:
        # Hash the password
        password = "Raju@2006"
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Generate MFA secret
        mfa_secret = pyotp.random_base32()
        
        # Create admin user
        admin_user = {
            "username": "Raju",
            "password_hash": hashed_password.decode('utf-8'),
            "mfa_secret": mfa_secret,
            "role": "Admin",
            "created_at": None  # Will be set by MongoDB if you want
        }
        
        await user_collection.insert_one(admin_user)
        print("✅ Main Admin user 'Raju' created successfully")
        print(f"   Username: Raju")
        print(f"   Password: Raju@2006")
        print(f"   Role: Admin (Full access)")
        print(f"   MFA Secret: {mfa_secret}")
        print(f"   MFA QR: otpauth://totp/SecureApp:Raju?secret={mfa_secret}&issuer=SecureApp")
    else:
        print("✅ Main Admin user 'Raju' already exists")