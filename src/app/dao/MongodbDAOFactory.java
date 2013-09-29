package app.dao;

import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;

import java.io.*;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Properties;

public class MongodbDAOFactory extends DAOFactory {

    static MongoClient mongoClient;
    static MongoCredential credential;

    private static String dbName;

    public static String getDbName() {
        return dbName;
    }


    @Override
    public LocationDAO getLocationDAO() {
        try {
            return new MongodbLocationDAO();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static MongoClient createConnection() {
        String dbPropFileLoc = System.getProperty("db.properties");
        InputStream fin = null;
        try {
            fin = new FileInputStream(new File(dbPropFileLoc));
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        Properties prop = new Properties();
        try {
            prop.load(fin);
        } catch (IOException e) {
            e.printStackTrace();
        }
        dbName = prop.getProperty("dbName");

        try {
            credential = MongoCredential.createMongoCRCredential(prop.getProperty("login"),
                    prop.getProperty("authDbName"), prop.getProperty("password").toCharArray());
            mongoClient = new MongoClient(new ServerAddress(prop.getProperty("host"),
                    Integer.parseInt(prop.getProperty("port"))), Arrays.asList(credential));
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }
        return mongoClient;
    }

    public static void closeConnection() {
        mongoClient.close();
    }

}
