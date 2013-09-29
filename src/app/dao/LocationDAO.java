package app.dao;

import app.model.Location;

import java.util.List;

public interface LocationDAO {

    public String addLocation(Location location);
    public boolean deleteLocation(String id);
    public Location getLocationById(String id);
    public boolean updateLocation(Location location);
    public List<Location> getLocationsBy(Location criteria);
    public List<Location> getLocationsPagedBy(int page, int rows, Location criteria);
    public List<Location> getAllLocations();
    public List<Location> getAllLocationsPaged(int page, int rows);
    public Long countAllItems();
    public Long countFoundItems(Location criteria);
}
