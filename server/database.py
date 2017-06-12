import datetime
import logging
from pymongo import MongoClient
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

class AppDatabase():
    '''
    DB wrapper for accessing local storge that supports the app.
    In theory this makes switching out storage backends easier, by gauranteeing _conn is private.
    '''

    def __init__(self, db_host, db_name):
        self.host = db_host
        self.name = db_name
        self.created = datetime.datetime.now()
        self._conn = MongoClient(db_host)[db_name]

    def check_connection(self):
        return self._conn.test.insert({'dummy': 'test'})

    def includes_user_named(self, username):
        return self.find_by_username(username) is not None

    def add_user_named(self, username):
        return self._conn.users.insert({'username': username, 'favoriteTopics': [], 'favoriteSources': [], 'favoriteCollections': []})

    def find_by_username(self, username):
        return self._conn.users.find_one({'username': username})

    def get_users_lists(self, username, list_name):
        return self.find_by_username(username)[list_name]

    def add_item_to_users_list(self, username, list_name, item):
        return self._conn.users.update_one({'username': username}, {'$push': {list_name: item}})

    def remove_item_from_users_list(self, username, list_name, item):
        return self._conn.users.update_one({'username': username}, {'$pull': {list_name: item}})

    def save_notebook_clipping(self, username, entry):
        return self._conn.notebook.insert({
            'username': username,
            'createdDate': datetime.datetime.now(),
            'entry': entry
        })

    def list_notebook_clippings(self, username, app=None):
        filters = {
            'username': username
        }
        if app is not None:
            filters['entry.app'] = app
        return self._conn.notebook.find(filters)

    def load_notebook_clipping(self, entry_id):
        return self._conn.users.find_one({'_id': ObjectId(entry_id)})
