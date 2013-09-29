package app.dao;

public abstract class DAOFactory {

    public static final int MONGODB = 1;

    public abstract LocationDAO getLocationDAO();

    public static DAOFactory getDAOFactory(
            int whichFactory) {

        switch (whichFactory) {
            case MONGODB:
                return new MongodbDAOFactory();
            default           :
                return null;
        }
    }
}
