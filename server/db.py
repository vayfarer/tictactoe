# Michael Chen
# Users logic for google datastore database.



from google.cloud import datastore
import constants


client = datastore.Client()

def delete_user(user_id):
    """Also deletes their present from any related tables."""
    user_key = client.key(constants.users, user_id)
    user = client.get(key=user_key)
    if user:
        if user['table']:
            table_key = client.key(constants.tables, user['table'])
            table = client.get(key=table_key)
            if table:
                if user.key.id == table['X']:
                    table['X'] = None
                    table['X_username'] = ''
                if user.key.id == table['O']:
                    table['O'] = None
                    table['O_username'] = ''
                if table['O'] is None and table['X'] is None:
                    client.delete(table_key)
                    print(f'table id {table.key.id} removed')
                else:
                    table['open'] = True
                    client.put(table)
        client.delete(user_key)
        print(f'user id {user_id} removed')


def