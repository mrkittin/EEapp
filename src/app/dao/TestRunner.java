package app.dao;

public class TestRunner {
    public static void main(String[] args) {
        DAOFactory mongodbFactory = DAOFactory.getDAOFactory(DAOFactory.MONGODB);
        LocationDAO locationDAO = mongodbFactory.getLocationDAO();

        //locationDAO.deleteLocation("523b5da73004d17e5cf0dd17");

        //System.out.println(locationDAO.findLocation("1"));

        MongodbDAOFactory.closeConnection();
    }
}
