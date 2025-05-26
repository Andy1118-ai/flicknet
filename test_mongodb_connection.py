from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# MongoDB connection string with proper options
connection_string = "mongodb+srv://mugata:Abcd.1234@flicknet-cluster.v4ico9d.mongodb.net/?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000"

try:
    # Create MongoDB client
    client = MongoClient(connection_string)
    
    # Test connection by listing database names
    print("Testing MongoDB connection...")
    db = client['flicknet-cluster']  # Using the database name you provided
    
    # Try to access a collection (this will test the connection)
    collection_names = db.list_collection_names()
    print("\nConnection successful!")
    print(f"Database: {db.name}")
    print("Collections in database:")
    for collection in collection_names:
        print(f"- {collection}")
    
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print(f"\nConnection failed!")
    print(f"Error: {str(e)}")
    
finally:
    # Close the connection
    if 'client' in locals():
        client.close()
        print("\nConnection closed.")
