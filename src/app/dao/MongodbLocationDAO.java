package app.dao;

import app.model.Location;
import com.mongodb.*;
import org.mongojack.JacksonDBCollection;
import org.mongojack.WriteResult;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;

public class MongodbLocationDAO implements LocationDAO {

    private final String locationsCollectionName = "locations";

    private static MongoClient mongoClient = MongodbDAOFactory.createConnection();
    private static DB db;
    private static DBCollection dbCollection;
    private JacksonDBCollection<Location, String> coll;

    public MongodbLocationDAO() throws IOException {
        db = mongoClient.getDB(MongodbDAOFactory.getDbName());
        dbCollection = db.getCollection(locationsCollectionName);
        coll = JacksonDBCollection.wrap(dbCollection, Location.class, String.class);
    }

    @Override
    public String addLocation(Location location) {
        WriteResult<Location, String> result = coll.insert(location);
        return result.getSavedId();
    }

    @Override
    public boolean deleteLocation(String id) {
        try {
            coll.removeById(id);
            return true;
        } catch (MongoException e) {
            return false;
        }
    }

    @Override
    public Location getLocationById(String id) {
        return coll.findOneById(id);
    }

    @Override
    public boolean updateLocation(Location location) {
        try {
            coll.save(location);
            return true;
        } catch (MongoException e) {
            return false;
        }
    }

    @Override
    public List<Location> getLocationsBy(Location criteria) {
        //TODO
        return null;
    }

    @Override
    public List<Location> getLocationsPagedBy(int page, int rows, Location criteria) {
        return coll.find(convertLocationToDBObjRegexp(criteria)).skip(page*rows - rows).limit(rows)
                .sort(new BasicDBObject("date_modified",-1)).toArray();
    }

    @Override
    public List<Location> getAllLocations() {
        return coll.find().toArray();
    }

    @Override
    public List<Location> getAllLocationsPaged(int page, int rows) {
        return coll.find().skip(page*rows - rows).limit(rows).sort(new BasicDBObject("date_modified",-1)).toArray();
    }

    @Override
    public Long countAllItems() {
        return coll.count();
    }

    @Override
    public Long countFoundItems(Location criteria) {
        return coll.count(convertLocationToDBObjRegexp(criteria));
    }

    private BasicDBObject convertLocationToDBObjRegexp(Location criteria) {
        BasicDBObject oldObj = criteria.asBasicDBObject();
        BasicDBObject newObj = new BasicDBObject();
        for (String key : oldObj.keySet()) {
            newObj.put(key, java.util.regex.Pattern.compile(oldObj.get(key).toString(), Pattern.CASE_INSENSITIVE));
        }
        return newObj;
    }
}
