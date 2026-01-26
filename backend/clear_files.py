"""
Quick script to clear all files from the database
Run this to delete old files that were encrypted with old RSA keys
"""
import asyncio
from db.mongodb_client import file_collection

async def clear_all_files():
    result = await file_collection.delete_many({})
    print(f"✅ Deleted {result.deleted_count} files from database")
    print("Now you can upload new files that will work with the current RSA keys")

if __name__ == "__main__":
    asyncio.run(clear_all_files())
