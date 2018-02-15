
// Thumbnail image
var Image = require("parse-image");

// Moment
var moment = require('moment');

/* Make user profile image thumbnail */
Parse.Cloud.beforeSave("_User", function(request, response) {
  var user = request.object;
  if (!user.get("profileImage")) {
    response.success();
    //response.error("Users must have a profile photo.");
    return;
  }
 
  if (!user.dirty("profileImage")) {
    // The profile photo isn't being modified.
    response.success();
    return;
  }
 
  Parse.Cloud.httpRequest({
    url: user.get("profileImage").url()
 
  }).then(function(response) {
    var image = new Image();
    return image.setData(response.buffer);
 
  }).then(function(image) {
    // Crop the image to the smaller of width or height.
    var size = Math.min(image.width(), image.height());
    return image.crop({
      left: (image.width() - size) / 2,
      top: (image.height() - size) / 2,
      width: size,
      height: size
    });
 
  }).then(function(image) {
    // Resize the image to 64x64.
    return image.scale({
      width: 128,
      height: 128
    });
 
  }).then(function(image) {
    // Make sure it's a JPEG to save disk space and bandwidth.
    return image.setFormat("JPEG");
 
  }).then(function(image) {
    // Get the image data in a Buffer.
    return image.data();
 
  }).then(function(buffer) {
    // Save the image into a new file.
    var base64 = buffer.toString("base64");
    var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
    return cropped.save();
 
  }).then(function(cropped) {
    // Attach the image file to the original object.
    user.set("profileImageThumbnail", cropped);
 
  }).then(function(result) {
    response.success();
  }, function(error) {
    response.error(error);
  });
}); 



/* Projects */ 
/* Before save projects */ 
Parse.Cloud.beforeSave('Projects', function(request, response) {
  var project = request.object;
  var data;


  data = project.get('projectName')+' '+project.get('location')+' '+project.get('tags')+' '+project.get('type')+' '+project.get('category');

  var words = data.split(/[ ,]+/);
  words = words.map(function(w) { return w.toLowerCase()});
  var stopWords = ['el', 'la', 'y', 'de', 'del', 'en', 'las', 'un', 'uno', 'una', 'unas', 'unos',  'sobre', ','];
  words = words.filter(function(w) { return stopWords.indexOf(w) == -1});

  // var hashtags = project.get("tags").match(/#.+?b/g);
  // hashtags = _.map(hashtags, toLowerCase);

  project.set('words', words);
  // project.set("hashtags", hashtags);
  response.success();
});




/* Send welcome email */
Parse.Cloud.define("sendWelcomeEmail", function(request, response) {
  
    var message = "<p>Hola "+ request.params.userName+",</p><br>"+
    "<p>Bienvenido a Topintelecto, somos la plataforma que facilita el contacto entre empresas y profesionales para realizar cualquier proyecto de Arquitectura e Ingeniería. Si no has llenado tu perfil aún es importante que lo hagas para empezar a presupuestar o subir proyectos en la plataforma.</p><br>"+
    "<p>Lo único que tienes que hacer es ingresar en el siguiente Link y Proceder a completar tu perfil: <a href='http://topintelecto.herokuapp.com/profesionales/perfil-profesional'>http://topintelecto.herokuapp.com/profesionales/perfil-profesional</a></p><br>"+
    "<p>Carlos Rojas.</p>"+
    "<p>Fundador de Topintelecto.</p><br>";
  
    var template = {
          filters: {
            templates: {
              settings: {
                enable: 1,
                template_id: "dee9713a-55c7-4dcc-be90-edb8d4870177"
              }
            }
          }
        };  
  
    var temp = JSON.stringify(template);  
  
    Parse.Cloud.httpRequest({ 
  
      method: 'POST', 
      headers: {
        'Authorization': 'Bearer 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'
      },
      url: 'https://api.sendgrid.com/api/mail.send.json', 
      body: {
        to: request.params.userEmail,
        from: "carlos.r@topintelecto.com",
        subject: "Bienvenido a Topintelecto",
        fromname: "Carlos de topintelecto",
        html: message,
        "x-smtpapi": temp
      }
    }).then(function(httpResponse){
  
        console.log("Successfully sent email");
        response.success("Email sent!");
  
  
    }, function(error){
  
        console.log(error);
        console.log("Could not sent email");
        response.error("Could not sent email");
  
    });
  
  });


/* Profile finished email */
Parse.Cloud.define("profileFinishedEmail", function(request, response) {
  
    var message = "<p>Hola "+ request.params.userName+",</p><br>"+
    "<p>Gracias por culminar la creación de tu perfil, Topintelecto es una comunidad que está iniciando en este momento, por eso nos gustaría recibir cualquier recomendación o duda de tu parte.</p>"+ 
    "<p>Ofrecemos este servicio para mejorar el proceso de contratación de las empresas que necesitan realizar proyectos de Ingeniería o Arquitectura facilitando el acceso a los mejores profesionales en cada área de diseño. De esta manera se reducen los costos y la persona correcta recibe el pago por su trabajo de manera rápida y segura.</p><br>"+
    "<p>No dudes en responder este correo para darnos tus sugerencias.</p><br>"+
    "<p>Carlos Rojas.</p>"+
    "<p>Fundador de Topintelecto.</p><br>";
  
    var template = {
          filters: {
            templates: {
              settings: {
                enable: 1,
                template_id: "dee9713a-55c7-4dcc-be90-edb8d4870177"
              }
            }
          }
        };  
  
    var temp = JSON.stringify(template);  
  
    Parse.Cloud.httpRequest({ 
  
      method: 'POST', 
      headers: {
        'Authorization': 'Bearer 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'
      },
      url: 'https://api.sendgrid.com/api/mail.send.json', 
      body: {
        to: request.params.userEmail,
        from: "carlos.r@topintelecto.com",
        subject: "Perfil completado - Topintelecto",
        fromname: "Carlos de topintelecto",
        html: message,
        "x-smtpapi": temp
      }
    }).then(function(httpResponse){
  
        console.log("Successfully sent email");
        response.success("Email sent!");
  
  
    }, function(error){
  
        console.log(error);
        console.log("Could not sent email");
        response.error("Could not sent email");
  
    });
  
  });


/* Project published email */
Parse.Cloud.define("projectPublishedEmail", function(request, response) {
  
    var message = "<p>Hola "+ request.params.userName+",</p><br>"+
    "<p>Tu proyecto ha sido publicado exitosamente, pronto recibirás presupuestos de diferentes profesionales para realizarlo. A continuación, te daremos algunos consejos para que encuentres al profesional indicado:</p><br>"+ 
    "<p>1. Evalúa que ofertas están dentro de tu presupuesto.</p>"+
    "<p>2. Observa la experiencia de los profesionales y descarta los que no tengan relación con el área de tu proyecto.</p>"+
    "<p>3. Busca el profesional que ha realizado proyectos parecidos al tuyo.</p>"+
    "<p>4. Realiza las preguntas que consideres pertinentes a cada postulante.</p>"+
    "<p>5. Revisa la reputación de los profesionales que son candidatos potenciales a realizar el proyecto.</p>"+
    "<p>6.Procede a elegir quien realizará tu proyecto.</p><br>"+
    "<p>Sigue estos pasos y encontrarás el profesional mejor capacitado para realizar tu proyecto!.</p><br>"+
    "<p>Carlos Rojas.</p>"+
    "<p>Fundador de Topintelecto.</p><br>";
  
    var template = {
          filters: {
            templates: {
              settings: {
                enable: 1,
                template_id: "dee9713a-55c7-4dcc-be90-edb8d4870177"
              }
            }
          }
        };  
  
    var temp = JSON.stringify(template);  
  
    Parse.Cloud.httpRequest({ 
  
      method: 'POST', 
      headers: {
        'Authorization': 'Bearer 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'
      },
      url: 'https://api.sendgrid.com/api/mail.send.json', 
      body: {
        to: request.params.userEmail,
        from: "carlos.r@topintelecto.com",
        subject: "Proyecto publicado - Topintelecto",
        fromname: "Carlos de topintelecto",
        html: message,
        "x-smtpapi": temp
      }
    }).then(function(httpResponse){
  
        console.log("Successfully sent email");
        response.success("Email sent!");
  
  
    }, function(error){
  
        console.log(error);
        console.log("Could not sent email");
        response.error("Could not sent email");
  
    });
  
  });


/* Aplication email */
Parse.Cloud.define("aplicationEmail", function(request, response) {
  
  var message = "<p>Hola "+ request.params.userName+",</p><br>"+
    "<p>Un profesional ha aplicado a tu proyecto,  puedes ver los detalles en: <a href='http://topintelecto.herokuapp.com/perfil/proyecto/"+request.params.projectId+"/postulados'>http://topintelecto.herokuapp.com/perfil/proyecto/"+request.params.projectId+"/postulados</a></p><br>"+
    "<p>Carlos Rojas.</p>"+
    "<p>Fundador de Topintelecto.</p><br>";
  
    var template = {
          filters: {
            templates: {
              settings: {
                enable: 1,
                template_id: "dee9713a-55c7-4dcc-be90-edb8d4870177"
              }
            }
          }
        };  
  
    var temp = JSON.stringify(template);  
  
    Parse.Cloud.httpRequest({ 
  
      method: 'POST', 
      headers: {
        'Authorization': 'Bearer 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'
      },
      url: 'https://api.sendgrid.com/api/mail.send.json', 
      body: {
        to: request.params.userEmail,
        from: "carlos.r@topintelecto.com",
        subject: "Has sido seleccionado para un proyecto! - Topintelecto",
        fromname: "Carlos de topintelecto",
        html: message,
        "x-smtpapi": temp
      }
    }).then(function(httpResponse){
  
        console.log("Successfully sent email");
        response.success("Email sent!");
  
  
    }, function(error){
  
        console.log(error);
        console.log("Could not sent email");
        response.error("Could not sent email");
  
    });
  
  });


/* Selected email */
Parse.Cloud.define("selectedEmail", function(request, response) {
  
    var message = "<p>¡Buenas noticias!  "+ request.params.userName+",</p><br>"+
    "<p>Has sido seleccionado para realizar el proyecto xxxxxxxxxxxxx. A continuación verás los datos suministrados por el cliente, recuerda realizar un trabajo excelente para que el cliente quede satisfecho.</p><br>"+
    "<p>Carlos Rojas.</p>"+
    "<p>Fundador de Topintelecto.</p><br>";
  
    var template = {
          filters: {
            templates: {
              settings: {
                enable: 1,
                template_id: "dee9713a-55c7-4dcc-be90-edb8d4870177"
              }
            }
          }
        };  
  
    var temp = JSON.stringify(template);  
  
    Parse.Cloud.httpRequest({ 
  
      method: 'POST', 
      headers: {
        'Authorization': 'Bearer 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'
      },
      url: 'https://api.sendgrid.com/api/mail.send.json', 
      body: {
        to: request.params.userEmail,
        from: "carlos.r@topintelecto.com",
        subject: "Has sido seleccionado para un proyecto! - Topintelecto",
        fromname: "Carlos de topintelecto",
        html: message,
        "x-smtpapi": temp
      }
    }).then(function(httpResponse){
  
        console.log("Successfully sent email");
        response.success("Email sent!");
  
  
    }, function(error){
  
        console.log(error);
        console.log("Could not sent email");
        response.error("Could not sent email");
  
    });
  
  });