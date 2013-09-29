package app.model;

import java.util.List;

public class LocationsWrapper {

    public List<Location> rows;
    public String total;

    public LocationsWrapper(List<Location> locations, String total) {
        this.rows = locations;
        this.total = total;
    }
}
