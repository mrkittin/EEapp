package app.model;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.mongodb.BasicDBObject;
import org.mongojack.ObjectId;

import javax.persistence.Id;
import javax.ws.rs.FormParam;
import javax.ws.rs.core.MultivaluedMap;
import java.util.*;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Location {

    @Id
    @ObjectId
    @FormParam("id")
    private String id;

    @FormParam("name")
    @JsonProperty("name")
    private String name;

    @FormParam("lat")
    @JsonProperty("lat")
    private String lat;

    @FormParam("lng")
    @JsonProperty("lng")
    private String lng;

    @FormParam("city")
    @JsonProperty("city")
    private String city;

    @FormParam("country")
    @JsonProperty("country")
    private String country;

    @FormParam("date_modified")
    @JsonProperty("date_modified")
    private Date date_modified;

    @FormParam("formatted_address")
    @JsonProperty("formatted_address")
    private String formatted_address;

    @FormParam("website")
    @JsonProperty("website")
    private String website;

    @FormParam("international_phone_number")
    @JsonProperty("international_phone_number")
    private String international_phone_number;

    @FormParam("zoom")
    @JsonProperty("zoom")
    private String zoom;

    @FormParam("description")
    @JsonProperty("description")
    private String description;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getZoom() {
        return zoom;
    }

    public void setZoom(String zoom) {
        this.zoom = zoom;
    }

    public String getInternational_phone_number() {
        return international_phone_number;
    }

    public void setInternational_phone_number(String international_phone_number) {
        this.international_phone_number = international_phone_number;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getFormatted_address() {
        return formatted_address;
    }

    public void setFormatted_address(String formatted_address) {
        this.formatted_address = formatted_address;
    }

    public Date getDate_modified() {
        return date_modified;
    }

    public void setDate_modified(Date date_modified) {
        this.date_modified = date_modified;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }


    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLat() {
        return lat;
    }

    public void setLat(String lat) {
        this.lat = lat;
    }

    public String getLng() {
        return lng;
    }

    public void setLng(String lng) {
        this.lng = lng;
    }

    public Location() {
    }

    public static Location fromMultivaluedMap(MultivaluedMap<String, String> oldMap) {
        ObjectMapper m = new ObjectMapper();
        HashMap<String, String> newMap = new HashMap<String, String>();

        for (String string : oldMap.keySet()) {
            if (!string.equals("page") && !string.equals("rows") && !oldMap.getFirst(string).isEmpty()) {
                newMap.put(string, oldMap.getFirst(string));
            }
        }
        return m.convertValue(newMap, Location.class);
    }

    public HashMap<String, String> asMap() {
        ObjectMapper m = new ObjectMapper();
        return m.convertValue(this, TypeFactory.defaultInstance().constructMapType(HashMap.class, String.class, String.class));
    }

    public HashMap<String, String> asNotNullValuesMap() {
        HashMap<String, String> oldMap = asMap();
        HashMap<String, String> newMap = new HashMap<String, String>();
        for (String obj : oldMap.keySet()) {
            if (null != oldMap.get(obj)) {
                newMap.put(obj, oldMap.get(obj));
            }
        }
        return newMap;
    }

    public HashMap<String, String> asNotNullAndNotEmptyValuesMap() {
        HashMap<String, String> oldMap = asMap();
        HashMap<String, String> newMap = new HashMap<String, String>();
        for (String obj : oldMap.keySet()) {
            if (null != oldMap.get(obj) && !oldMap.get(obj).isEmpty()) {
                newMap.put(obj, oldMap.get(obj));
            }
        }
        return newMap;
    }

    public BasicDBObject asBasicDBObject() {
        return new BasicDBObject(this.asNotNullValuesMap());
    }
}
