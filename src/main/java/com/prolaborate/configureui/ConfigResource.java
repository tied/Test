package com.prolaborate.configureui;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.apache.log4j.Logger;
import org.apache.log4j.Level;
import org.apache.log4j.PatternLayout;
import org.apache.log4j.RollingFileAppender;
import com.atlassian.json.jsonorg.JSONObject;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.nio.charset.Charset;

import javax.inject.Inject;

import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.sal.api.transaction.TransactionCallback;
import com.atlassian.sal.api.transaction.TransactionTemplate;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.spring.container.ContainerManager;
import com.atlassian.confluence.setup.settings.SettingsManager;
import com.atlassian.plugins.rest.common.security.AnonymousAllowed;
@Path("/")
@Scanned
public class ConfigResource
{
    @ComponentImport
    private final UserManager userManager;
    @ComponentImport
    private final PluginSettingsFactory pluginSettingsFactory;
    @ComponentImport 
    private final TransactionTemplate transactionTemplate;
    
    public static Logger log = Logger.getLogger(ConfigResource.class);
    
    @Inject
    public ConfigResource(UserManager userManager, PluginSettingsFactory pluginSettingsFactory,
                          TransactionTemplate transactionTemplate)
    {
        this.userManager = userManager;
        this.pluginSettingsFactory = pluginSettingsFactory;
        this.transactionTemplate = transactionTemplate;
        
        log.setLevel(Level.ERROR);
        
      //Define log pattern layout
		PatternLayout layout = new PatternLayout("%d{ISO8601} [%t] %-5p %c %x - %m%n");
		 
		//Add console appender to root logger
		//log.addAppender(new ConsoleAppender(layout));
		try
		{
		//Define file appender with layout and output log file name
		RollingFileAppender fileAppender = new RollingFileAppender(layout, "logs/prolaborate-confluence.log");
		 
		//Add the appender to root logger
		//rootLogger.addAppender(fileAppender);
		log.addAppender(fileAppender);
		}
		catch (IOException e)
		{
		System.out.println("Failed to add appender !!");
		}
		
		log.info("logger on constructor");
    }
    
    @GET
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response get(@Context HttpServletRequest request)
    {
      return Response.ok(transactionTemplate.execute(new TransactionCallback()
      {
        public Object doInTransaction()
        {
          PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
          Config config = new Config();
          try {
        	  config.setProtocol((String) settings.get(Config.class.getName() + ".protocol"));
			  config.setServer((String) settings.get(Config.class.getName() + ".server"));
			  config.setPort((String) settings.get(Config.class.getName() + ".port"));
			  config.setToken((String) settings.get(Config.class.getName() + ".token"));
			  config.setUserId((String) settings.get(Config.class.getName() + ".userid"));
			  config.setRepositoryId((String) settings.get(Config.class.getName() + ".repositoryId"));
			  config.setRepositoryIdsList((String) settings.get(Config.class.getName() + ".repositoryIdsList"));
			  
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("Read Configuration Exception: " +e.getMessage()+"\n");
		}
          
          com.prolaborate.configureui.ConfigResource.log.info("protocol : "+config.protocol);
          com.prolaborate.configureui.ConfigResource.log.info("server : "+config.server);
          com.prolaborate.configureui.ConfigResource.log.info("port : "+config.port);
		  com.prolaborate.configureui.ConfigResource.log.info("token : "+config.token);
          com.prolaborate.configureui.ConfigResource.log.info("repositoryId : "+config.repositoryId);
		  com.prolaborate.configureui.ConfigResource.log.info("repositoryIdsList : "+config.repositoryIdsList);
          
          return config;          
        }
      })).build();
    }
    
    @GET
    @Path("/GetBaseUrl")
	@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response GetBaseUrl(@Context HttpServletRequest request) {
    	com.prolaborate.configureui.ConfigResource.log.info("GetBaseUrl Initiated"+"\n");
    	    	
    	return Response.ok(transactionTemplate.execute(new TransactionCallback()
        {
            public Object doInTransaction()
            {
              BaseURL baseurlVal = new BaseURL(); 
              try {
            	  SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
      			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl(); 
      			baseurlVal.BaseURL=baseUrl;
    		} catch (Exception e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			com.prolaborate.configureui.ConfigResource.log.error("Read BaseUrl Exception: " +e.getMessage()+"\n");
    		}
              
             
              
              return baseurlVal;          
            }
          })).build();
    }
    
    @GET
    @Path("/ProlabReps")
	@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getProlaborateRepositories(@Context HttpServletRequest request) {
    	com.prolaborate.configureui.ConfigResource.log.info("getProlaborateRepositories Initiated"+"\n");
    	
    	HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
            String token = (String) settings.get(Config.class.getName() + ".token");
            String userid = (String) settings.get(Config.class.getName() + ".userid");
			
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			uri += "/API/I.aspx/GetProlaborateRepositories";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			 connection.setDoOutput(true);
			 JSONObject sendObject = new JSONObject();
			 sendObject.putOpt("UserLogId", userid);
			//connection.connect();
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getProlaborateRepositories returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getProlaborateRepositories MalformedURLException: " + e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getProlaborateRepositories ProtocolException: " + e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getProlaborateRepositories IOException: " + e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getProlaborateRepositories Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getProlaborateRepositories Exception: " + e.getMessage()+"\n");
    	}
	
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) { 
            	   com.prolaborate.configureui.ConfigResource.log.error("getProlaborateRepositories Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
    @GET
    @Path("/ProlabConnect")
	@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getProlabConnect(@Context HttpServletRequest request) {
    	com.prolaborate.configureui.ConfigResource.log.info("ProlabConnect Initiated"+"\n");
    	
    	HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
            String token = (String) settings.get(Config.class.getName() + ".token");
            String userid = (String) settings.get(Config.class.getName() + ".userid");
			
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			uri += "/API/I.aspx/ProlaborateConnect";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			 connection.setDoOutput(true);
			 JSONObject sendObject = new JSONObject();
			 sendObject.putOpt("UserLogId", userid);
			//connection.connect();
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
					break;
				case 403:		
					log.error("ProlaborateConnect returned 403 Error: ");
			        return Response.status(HttpServletResponse.SC_FORBIDDEN).build();
				case 404:
					log.error("ProlaborateConnect returned 404 Error: ");
					return Response.status(HttpServletResponse.SC_NOT_FOUND).build();
				default:
					log.error("ProlaborateConnect returned server Error: ");
					return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("ProlaborateConnect MalformedURLException: " + e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("ProlaborateConnect ProtocolException: " + e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("ProlaborateConnect IOException: " + e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("ProlaborateConnect Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("ProlaborateConnect Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) { 
            	   com.prolaborate.configureui.ConfigResource.log.error("ProlaborateConnect Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    @POST
    @Path("/ProlabDiagramStereotypes")
	@Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getDiagramStereotypes(final GetStereotypeByRepId getStereotypeByRepIdparam, @Context HttpServletRequest request) {
    	com.prolaborate.configureui.ConfigResource.log.info("getDiagramStereotypes Initiated"+"\n");
    	
    	HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
			String userid = (String) settings.get(Config.class.getName() + ".userid");
            String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}			
			if(getStereotypeByRepIdparam.repositoryId!="")
			{
				repositoryId=getStereotypeByRepIdparam.repositoryId;
			}
			uri += "/API/I.aspx/GetDiagramStreotypes";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("RepositoryId", repositoryId);
			sendObject.putOpt("FilterType", "ALL");
			sendObject.putOpt("UserLogId",userid);
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getDiagramStereotypes returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getDiagramStereotypes MalformedURLException: " +e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getDiagramStereotypes ProtocolException: " +e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getDiagramStereotypes IOException: " +e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getDiagramStereotypes Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getDiagramStereotypes Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getDiagramStereotypes Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
	@POST
    @Path("/ProlabElementStereotypes")
	@Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getElementStereotypes(final GetStereotypeByRepId getStereotypeByRepIdparam, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getElementStereotypes Initiated"+"\n");
    	
    	HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
			String userid = (String) settings.get(Config.class.getName() + ".userid");
            String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			if(getStereotypeByRepIdparam.repositoryId!=null && getStereotypeByRepIdparam.repositoryId!="")
			{
				repositoryId=getStereotypeByRepIdparam.repositoryId;
			}
			uri += "/API/I.aspx/GetElementStreotypes";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("RepositoryId", repositoryId);
			sendObject.putOpt("FilterType", "ALL");
			sendObject.putOpt("UserLogId", userid);
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("GetElementStreotypes returned server Error: ");
			        return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementStereotypes MalformedURLException: "+ e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementStereotypes ProtocolException: "+ e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementStereotypes IOException: "+ e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getElementStereotypes Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementStereotypes Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getElementStereotypes Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
     
	@POST
	@Path("/ProlConnect")
	@Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
	public Response getProlaborateConnection(final Config config, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getProlaborateConnection Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	
		//This is the root logger provided by log4j
		//Logger rootLogger = Logger.getRootLogger();
    	StringBuilder sb = new StringBuilder();
    	try {
    		SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
    		String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
    		//rootLogger.setLevel(Level.DEBUG);
    		 
    		
    		//Let verify the log messages
    		log.info("LOG ON prolconnect method");
    		
            String protocol = config.getProtocol();
            String server = config.getServer();
            String port = config.getPort();
			String token = config.getToken();
			String userid = config.getUserId();
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			log.info("Prol-URI " + uri);
			uri += "/API/I.aspx/GetProlaborateRepositories";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			 connection.setDoOutput(true);
			 JSONObject sendObject = new JSONObject();
			 sendObject.putOpt("UserLogId", userid);
			//connection.connect();
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			int status = connection.getResponseCode();
			
			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
				case 403:	
					log.error("GetProlaborateRepositories returned 403 status: ");
			        return Response.status(HttpServletResponse.SC_FORBIDDEN).build();
				case 404:
					log.error("GetProlaborateRepositories returned 404 status: ");
					return Response.status(HttpServletResponse.SC_NOT_FOUND).build();
			    default:
			    	log.error("GetProlaborateRepositories returned server Error: ");
			        return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			log.error("Prolaborate Connection MalformedURLException Problem: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getProlaborateConnection MalformedURLException: " + e.getMessage()+"\n");
		} catch (ProtocolException e) {
			log.error("Prolaborate Connection ProtocolException Problem: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getProlaborateConnection ProtocolException: " + e.getMessage()+"\n");
		} catch (IOException e) {
			log.error("Prolaborate Connection IOException Problem: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getProlaborateConnection IOException: " + e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("Prolaborate Connection Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getProlaborateConnection Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getProlaborateConnection Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }

    @POST
    @Path("/ProlabDiagramsList")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getDiagramsList(final DiagramFilter filterParams, @Context HttpServletRequest request) {
    	com.prolaborate.configureui.ConfigResource.log.info("getDiagramsList Initiated"+"\n");
    	
    	HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
			String userid = (String) settings.get(Config.class.getName() + ".userid");
            String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			if(filterParams.repositoryId!=null && filterParams.repositoryId!="")
			{
				repositoryId=filterParams.repositoryId;
			}
			uri += "/API/I.aspx/GetDiagramList";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("repositoryId", repositoryId);
			sendObject.putOpt("UserLogId", userid);
			sendObject.putOpt("DiagramName", filterParams.DiagramName);
			sendObject.putOpt("Author", filterParams.Author);
			sendObject.putOpt("Type", filterParams.DiagramType);
			sendObject.putOpt("Stereotype", "[\""+filterParams.Stereotype+"\"]");
			sendObject.putOpt("limit", 10);
			sendObject.putOpt("startIndex", filterParams.StartIndex);
			sendObject.putOpt("SortBy", "Modified");
			sendObject.putOpt("SortOrder", "DESC"); 

			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("GetDiagramList returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getDiagramsList MalformedURLException: "+e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getDiagramsList ProtocolException: "+e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getDiagramsList IOException: "+e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getDiagramsList General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getDiagramsList Exception: " + e.getMessage()+"\n");
    	}    	
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getDiagramsList Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
	@POST
    @Path("/ProlabPackageList")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getPackageList(final PackageFilter filterParams, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getPackageList Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
    		SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
			String userid = (String) settings.get(Config.class.getName() + ".userid");
            String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			if(filterParams.repositoryId!=null && filterParams.repositoryId!="")
			{
				repositoryId=filterParams.repositoryId;
			}
			uri += "/API/I.aspx/GetPackageList";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("repositoryId", repositoryId);
			sendObject.putOpt("UserLogId", userid);
			sendObject.putOpt("PackageName", filterParams.PackageName);
			sendObject.putOpt("Author", filterParams.Author);			
			sendObject.putOpt("limit", 10);
			sendObject.putOpt("startIndex", filterParams.StartIndex);
			sendObject.putOpt("SortBy", "Modified");
			sendObject.putOpt("SortOrder", "DESC");
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
			        	     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getPackageList returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getPackageList MalformedURLException: "+ e.getMessage() +"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getPackageList ProtocolException: "+ e.getMessage() +"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getPackageList IOException: "+ e.getMessage() +"\n");
		}
    	catch (Exception e) {
    		log.error("getPackageList General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getPackageList Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getPackageList Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
	@POST
    @Path("/ProlabElementList")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getElementList(final ElementFilter filterParams, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getElementList Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
    		SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
			String userid = (String) settings.get(Config.class.getName() + ".userid");
            String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			if(filterParams.repositoryId!=null && filterParams.repositoryId!="")
			{
				repositoryId=filterParams.repositoryId;
			}
			uri += "/API/I.aspx/GetElementList";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("repositoryId", repositoryId);
			sendObject.putOpt("UserLogId", userid);
			sendObject.putOpt("ElementName", filterParams.ElementName);
			sendObject.putOpt("Author", filterParams.Author);			
			sendObject.putOpt("Type", filterParams.ElementType);
			sendObject.putOpt("Stereotype", "[\""+filterParams.Stereotype+"\"]");
			sendObject.putOpt("limit", 10);
			sendObject.putOpt("startIndex", filterParams.StartIndex);
			sendObject.putOpt("SortBy", "Modified");
			sendObject.putOpt("SortOrder", "DESC");
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getElementList returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementList MalformedURLException: "+e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementList ProtocolException: "+e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementList IOException: "+e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getElementList General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementList Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getElementList Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }

	@POST
    @AnonymousAllowed
    @Path("/ProlabGetArtifacts")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getArtifactsAPI(final GetArtifactsParam ArtifactsParam, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getArtifactsAPI Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
    		SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
			String userid = (String) settings.get(Config.class.getName() + ".userid");
            //String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			uri += "/API/I.aspx/GetArtifactsAPI";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("repositoryId", ArtifactsParam.repositoryId);
			sendObject.putOpt("UserLogId", userid);
			sendObject.putOpt("ElementGuid", ArtifactsParam.Guid);
			sendObject.putOpt("ElementType", ArtifactsParam.ElementType);
			sendObject.putOpt("parentguids", ArtifactsParam.parentguids);
			sendObject.putOpt("includeRecursive", ArtifactsParam.IncludeRecursive);			
			
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("GetArtifactsAPI returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getArtifactsAPI MalformedURLException: "+e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getArtifactsAPI ProtocolException: "+e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getArtifactsAPI IOException: "+e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getArtifactsAPI General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getArtifactsAPI Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getArtifactsAPI Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
	@POST
    @AnonymousAllowed
    @Path("/ProlabGetTabaleColumnsByGroupKey")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getTabaleColumnsByGroupKey(final GetGroupKeyParam GroupKeyParam, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getTabaleColumnsByGroupKey Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
    		SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
			String userid = (String) settings.get(Config.class.getName() + ".userid");
            //String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			uri += "/API/I.aspx/GetTabaleColumnsByGroupKeyAPI";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("repositoryId", GroupKeyParam.repositoryId);
			sendObject.putOpt("UserLogId", userid);
			sendObject.putOpt("ElementGuid", GroupKeyParam.Guid);
			sendObject.putOpt("ElementType", GroupKeyParam.ElementType);
			sendObject.putOpt("includeRecursive", GroupKeyParam.IncludeRecursive);			
			sendObject.putOpt("GroupKey", GroupKeyParam.GroupKey);
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getTabaleColumnsByGroupKey returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getTabaleColumnsByGroupKey MalformedURLException: "+e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getTabaleColumnsByGroupKey ProtocolException: "+e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getTabaleColumnsByGroupKey IOException: "+e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getTabaleColumnsByGroupKey General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getTabaleColumnsByGroupKey Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getTabaleColumnsByGroupKey Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
	@POST
    @AnonymousAllowed
    @Path("/ProlabGetChildTableHtml")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getChildTableHtml(final GetChildTableParam ChildTableParam, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getChildTableHtml Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
			String userid = (String) settings.get(Config.class.getName() + ".userid");
            //String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			uri += "/API/I.aspx/GetChildTableHtmlAPI";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("repositoryId", ChildTableParam.repositoryId);
			sendObject.putOpt("UserLogId", userid);
			sendObject.putOpt("ElementGuid", ChildTableParam.Guid);
			sendObject.putOpt("ElementType", ChildTableParam.ElementType);
			sendObject.putOpt("parentguids", ChildTableParam.parentguids);
			sendObject.putOpt("includeRecursive", ChildTableParam.IncludeRecursive);			
			sendObject.putOpt("GroupKey", ChildTableParam.GroupKey);
			sendObject.putOpt("TableDraw", ChildTableParam.TableDraw);
			sendObject.putOpt("StartIndex", ChildTableParam.StartIndex);
			sendObject.putOpt("RowLength", ChildTableParam.RowLength);
			sendObject.putOpt("SearchValue", ChildTableParam.SearchValue);			
			sendObject.putOpt("dtrepcolumns", ChildTableParam.dtrepcolumns);
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getChildTableHtml returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getChildTableHtml MalformedURLException: "+e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getChildTableHtml ProtocolException: "+e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getChildTableHtml IOException: "+e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getChildTableHtml General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getChildTableHtml Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getChildTableHtml Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
	@POST
    @AnonymousAllowed
    @Path("/ProlabElementProperties")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getElementProperties(final GetElementPropertParam ElementPropertParam, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getElementProperties Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
            //String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			uri += "/API/I.aspx/GetArtifactAdditonalProperties";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("elementGuid", ElementPropertParam.Guid);
			sendObject.putOpt("elementType", ElementPropertParam.ElementType);
			sendObject.putOpt("RepositoryId", ElementPropertParam.repositoryId);
			sendObject.putOpt("UserId", "");			
			//sendObject.putOpt("GetChildren", false);
			
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
						     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getElementProperties returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementProperties MalformedURLException: "+e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementProperties ProtocolException: "+e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementProperties IOException: "+e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getElementProperties General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementProperties Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getElementProperties Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
	@POST
    @AnonymousAllowed
    @Path("/ProlabElementPropertiesLimited")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getElementPropertiesLimited(final ObjectInfoParam InfoParam, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getElementPropertiesLimited Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
            //String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			uri += "/API/I.aspx/GetElementPropertiesLimited";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("elementGuid", InfoParam.Guid);
			sendObject.putOpt("RepositoryId", InfoParam.repositoryId);
			sendObject.putOpt("UserId", "");
			
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
			        	     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getElementPropertiesLimited returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
		sb.append("Malformed exception : "+e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementPropertiesLimited MalformedURLException: "+e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append("ProtocolException exception : "+e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementPropertiesLimited ProtocolException: "+e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append("IOException exception : "+e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementPropertiesLimited IOException: "+e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getElementPropertiesLimited General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getElementPropertiesLimited Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getElementPropertiesLimited Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
	@POST
    @AnonymousAllowed
    @Path("/ProlabEADocXPath")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response getEADocXPath(final EADocXParam Param, @Context HttpServletRequest request) {
		com.prolaborate.configureui.ConfigResource.log.info("getEADocXPath Initiated"+"\n");
		
		HttpURLConnection connection = null;
    	StringBuilder sb = new StringBuilder();
    	try {
			SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
			String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
    		PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            String protocol = (String) settings.get(Config.class.getName() + ".protocol");
            String server = (String) settings.get(Config.class.getName() + ".server");
            String port = (String) settings.get(Config.class.getName() + ".port");
			String token = (String) settings.get(Config.class.getName() + ".token");
            //String repositoryId = (String) settings.get(Config.class.getName() + ".repositoryId");
			String uri = protocol+"://"+server;
			if(!port.isEmpty()) {
				uri += ":"+port;		
			}
			uri += "/API/I.aspx/GetEADocxDocumentPathAPI";
			URL url = new URL(uri);
			System.setProperty("http.agent", "");
			connection = (HttpURLConnection) url.openConnection();
			connection.setRequestMethod("POST");
			connection.setRequestProperty("content-type", "application/json; charset=utf-8");
			connection.setRequestProperty("REFERER",baseUrl);
			connection.setRequestProperty("proltoken",token);
			connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
			connection.setDoOutput(true);
			JSONObject sendObject = new JSONObject();
			sendObject.putOpt("documentId", Param.documentId);
			sendObject.putOpt("RepositoryId", Param.repositoryId);
			sendObject.putOpt("UserId", "");
			
			
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			//connection.connect();
			int status = connection.getResponseCode();

			switch (status) {
			    case 200:
			    case 201:
			        BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(),
			        	     Charset.forName("UTF-8").newDecoder()));
			        
			        String line;
			        while ((line = br.readLine()) != null) {
			            sb.append(line+"\n");
			        }
			        br.close();
			        sb.toString();
			        break;
			    default:
			    	log.error("getEADocXPath returned server Error: ");
			    	return Response.serverError().build();
			}
		} catch (MalformedURLException e) {
			sb.append("Malformed exception : "+e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getEADocXPath MalformedURLException: "+e.getMessage()+"\n");
		} catch (ProtocolException e) {
			sb.append("ProtocolException exception : "+e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getEADocXPath ProtocolException: "+e.getMessage()+"\n");
		} catch (IOException e) {
			sb.append("IOException exception : "+e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getEADocXPath IOException: "+e.getMessage()+"\n");
		}
    	catch (Exception e) {
    		log.error("getEADocXPath General Exception: " + e.getMessage());
			sb.append(e.getMessage()+"\n");
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("getEADocXPath Exception: " + e.getMessage()+"\n");
    	}
    	finally {
            if (connection != null) {
               try {
             	  connection.disconnect();
               } catch (Exception ex) {
            	   com.prolaborate.configureui.ConfigResource.log.error("getEADocXPath Exception: "+ex.getMessage()+"\n");
               }
            }
         }
    	return Response.ok(sb.toString()).build();
    }
    
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    public Response put(final Config config, @Context HttpServletRequest request)
    {
      String username = userManager.getRemoteUsername(request);
      if (username == null || !userManager.isSystemAdmin(username))
      {
        return Response.status(Status.UNAUTHORIZED).build();
      }

      transactionTemplate.execute(new TransactionCallback()
      {
        public Object doInTransaction()
        {
          PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
          try {
			pluginSettings.put(Config.class.getName() + ".protocol", config.getProtocol());
			  pluginSettings.put(Config.class.getName()  +".server", config.getServer());
			  pluginSettings.put(Config.class.getName()  +".port", config.getPort());
			   pluginSettings.put(Config.class.getName()  +".token", config.getToken());
			   pluginSettings.put(Config.class.getName()  +".userid", config.getUserId());
			  pluginSettings.put(Config.class.getName()  +".repositoryId", config.getRepositoryId());
			   pluginSettings.put(Config.class.getName()  +".repositoryIdsList", config.getRepositoryIdsList());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			com.prolaborate.configureui.ConfigResource.log.error("Save Config Exception: "+e.getMessage()+"\n");
		}
          return null;
        }
      });
      return Response.noContent().build();
    }
    
    @XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
    public static final class DiagramFilter
    {
    	@XmlElement public String repositoryId;
    	@XmlElement public String DiagramName;
    	@XmlElement public String DiagramType;
    	@XmlElement public String Stereotype;
		@XmlElement public String Author;
    	@XmlElement public Integer StartIndex;
    }   
	
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
    public static final class ElementFilter
    {
    	@XmlElement public String repositoryId;
    	@XmlElement public String ElementName;
    	@XmlElement public String ElementType;
    	@XmlElement public String Stereotype;
    	@XmlElement public Integer StartIndex;
		@XmlElement public String Author;
    }
			
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
    public static final class PackageFilter
    {
    	@XmlElement public String repositoryId;
    	@XmlElement public String PackageName;
    	@XmlElement public Integer StartIndex;
		@XmlElement public String Author;
    	@XmlElement public String Guid;
		
    }
	
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
    public static final class ObjectInfoParam
    {
    	@XmlElement public String repositoryId;		
    	@XmlElement public String Guid;		
    }
	
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
	public static final class GetArtifactsParam
	{	
    	@XmlElement public String repositoryId;
    	@XmlElement public String Guid;
		@XmlElement public String ElementType;
		@XmlElement public String parentguids;
		@XmlElement public Boolean IncludeRecursive;
	}
		
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
	public static final class GetGroupKeyParam
	{	
    	@XmlElement public String repositoryId;
    	@XmlElement public String Guid;
		@XmlElement public String ElementType;
		@XmlElement public Boolean IncludeRecursive;
		@XmlElement public String GroupKey;
	}
		
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
	public static final class GetChildTableParam
	{
			@XmlElement public String repositoryId;
			@XmlElement public String Guid;
			@XmlElement public String ElementType;
			@XmlElement public String parentguids;
			@XmlElement public String IncludeRecursive;			
			@XmlElement public String GroupKey;
			@XmlElement public String TableDraw;
			@XmlElement public String StartIndex;
			@XmlElement public String RowLength;
			@XmlElement public String SearchValue;			
			@XmlElement public Object dtrepcolumns;
	}
	
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
	public static final class GetElementPropertParam
	{
			@XmlElement public String repositoryId;
			@XmlElement public String Guid;
			@XmlElement public String ElementType;			
	}
	
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
    public static final class EADocXParam
    {
    	@XmlElement public String repositoryId;
    	@XmlElement public String documentId;		
    }	
	
    @XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
    public static final class Config
    {
      @XmlElement private String protocol;
      @XmlElement private String server;
      @XmlElement private String port;
	  @XmlElement private String token;
	  @XmlElement private String userid;
      @XmlElement private String repositoryId;
      @XmlElement private String repositoryIdsList;           
      
      public String getProtocol()
      {
        return protocol;
      }
            
      public void setProtocol(String protocol)
      {
        this.protocol = protocol;
      }
            
      public String getServer()
      {
        return server;
      }
            
      public void setServer(String server)
      {
        this.server = server;
      }
      
      public String getPort()
      {
        return port;
      }
            
      public void setPort(String port)
      {
        this.port = port;
      }
      
      public String getToken()
      {
        return token;
      }
            
      public void setToken(String token)
      {
        this.token = token;
      }
	  
      public String getUserId()
      {
        return userid;
      }
            
      public void setUserId(String userid)
      {
        this.userid = userid;
      }
	  
      public String getRepositoryId()
      {
        return repositoryId;
      }
            
      public void setRepositoryId(String repositoryId)
      {
        this.repositoryId = repositoryId;
      }
      
      public String getRepositoryIdsList()
      {
        return repositoryIdsList;
      }
      
      public void setRepositoryIdsList(String repositoryIdsList)
      {
        this.repositoryIdsList = repositoryIdsList;
      }
    }
    
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
	public static final class GetStereotypeByRepId
	{
			@XmlElement public String repositoryId;			
	}
	
	@XmlRootElement
    @XmlAccessorType(XmlAccessType.FIELD)
	public static final class BaseURL
	{
			@XmlElement public String BaseURL;			
	}
	
}