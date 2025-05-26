from pymongo import MongoClient

# MongoDB connection string with timeout parameters
connection_string = "mongodb+srv://mugata:Abcd.1234@flicknet-cluster.v4ico9d.mongodb.net/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000"

try:
    # Create MongoDB client
    client = MongoClient(connection_string)
    
    # Test connection by listing database names
    print("Testing MongoDB connection...")
    
    # Access the database
    db = client['flicknet-cluster']
    
    # Try to list collections
    collection_names = db.list_collection_names()
    print("\nConnection successful!")
    print(f"Database: {db.name}")
    print("Collections in database:")
    for collection in collection_names:
        print(f"- {collection}")
    
except Exception as e:
    print(f"\nConnection failed!")
    print(f"Error: {str(e)}")
    
finally:
    # Close the connection
    if 'client' in locals():
        client.close()
        print("\nConnection closed.")
