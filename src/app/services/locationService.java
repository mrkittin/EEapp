package app.services;

import app.dao.DAOFactory;
import app.dao.LocationDAO;
import app.model.Location;
import app.model.LocationsWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringEscapeUtils;

import org.jboss.resteasy.annotations.Form;
import org.jboss.resteasy.specimpl.ResteasyHttpHeaders;

import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.util.*;

@Path("location")
public class locationService {

    private static DAOFactory mongodbFactory = DAOFactory.getDAOFactory(DAOFactory.MONGODB);
    private static LocationDAO locationDAO = mongodbFactory.getLocationDAO();

    @Context org.jboss.resteasy.spi.HttpResponse response;

    @GET
    @Path("/getSupportedFields")
    @Produces(MediaType.APPLICATION_JSON)
    public HashMap<String, String> getSupportedFields() throws JsonProcessingException {
        Location l = new Location();
        l.setId("Id"); l.setName("Name"); l.setCity("City"); l.setCountry("Country"); l.setLat("Latitude");
        l.setLng("Longitude"); l.setDate_modified(null);
        return l.asMap();
    }

    @POST
    @Path("/getLocationById/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Location getLocationById(@PathParam("id") String id) {

        return locationDAO.getLocationById(id);
    }

    @POST
    @Path("/getAllLocations")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public LocationsWrapper getAllLocations(final MultivaluedMap<String, String> formParameters) {
        int page = Integer.parseInt(formParameters.getFirst("page"));
        int rows = Integer.parseInt(formParameters.getFirst("rows"));

        //search
        Location searchCriteria = Location.fromMultivaluedMap(formParameters);
        if (searchCriteria.asNotNullAndNotEmptyValuesMap().size() > 0) {
            return new LocationsWrapper(locationDAO.getLocationsPagedBy(page, rows, searchCriteria),
                    locationDAO.countFoundItems(searchCriteria).toString());
        }
        return new LocationsWrapper(locationDAO.getAllLocationsPaged(page, rows), locationDAO.countAllItems().toString());
    }

    @POST
    @Path("/deleteLocation")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Map<String, String> deleteLocation(final MultivaluedMap<String, String> formParameters) {

        String id = formParameters.getFirst("id");

        if (locationDAO.deleteLocation(id)) {
            Map<String, String> myMap = new HashMap<String, String>();
            myMap.put("success", "true");
            return myMap;
        }
        return null;
    }

    @POST
    @Path("/addLocation")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String addLocation (@Form Location location) throws JsonProcessingException {

        if (location.getId().isEmpty()) location.setId(null);
        location.setDate_modified(new Date());
        //update Location with id returned from db
        location.setId(locationDAO.addLocation(location));

        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(location);
    }

    @POST
    @Path("/editLocation")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String editLocation (@Form Location location) throws JsonProcessingException {

        location.setDate_modified(new Date());
        locationDAO.updateLocation(location);

        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(locationDAO.getLocationById(location.getId()));
    }

    private String safeSave(String string) {
        return StringEscapeUtils.escapeHtml4(string);
    }

}
