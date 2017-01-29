module.exports = function(grunt) {

  //requires
  var path = require('path');
  var target = grunt.option('target') || 'nope';

  //config
  var imageExtenstions = 'jpg|png|ico|gif|jpeg';
  var appDir = 'web/app';
  var vendorDir = appDir + '/vendor';
  var tmpDir = appDir + '/tmp';
  var appName = 'newapp';

  //matchers
  var matchers = {
    indexFiles: ['web/*.+(php|txt|ico|html)','web/.htaccess']
  };

  //requirejs helper object
  var rjs = {
    _files: [],
    _paths: [],
    _pathMap: {},
    _shim: {},
    _getHandle: function(filepath) {
      return filepath.replace(appDir+'/','').replace('.js','');
    },
    generateFiles: function() {
      this._files = grunt.file.expand([appDir+'/**/*.js']);
      //this._sfiles = grunt.file.expand([vendorDir+'/*.js',vendorDir+'/**/*.js',appDir+'/engine/engApp/*.js',appDir+'/engine/engApp/**/*.js',appDir+'/engine/engAuth/*.js',appDir+'/engine/engAuth/**/*.js',appDir+'/engine/engState/*.js',appDir+'/engine/engState/**/*.js',appDir+'/signup/*.js',appDir+'/signup/**/*.js',appDir+'*.js','!'+vendorDir+'/FileAPI/Grunfile.js']);
    },
    generatePaths: function() {
      if(!this._files.length || !this._sfiles.length) {
        this.generateFiles();
      }
      for (var i=0; i<this._files.length; i++) {
        if ( this._getHandle(this._files[i]).search(/FileAPI|^signup\/|signUpTemplate/) == -1)
        {
          this._paths.push(this._getHandle(this._files[i]));
          this._pathMap[this._getHandle(this._files[i])] =
              this._files[i].replace('.js','');
        }
      }
      appExcludeRegex = new RegExp("/FileAPI|^"+appName+"\\/|ngTemplateC/");
    },

    generateShim: function() {

      appInit = appName+'/init';
      this._shim = {
        'vendor/jquery/jquery': ['vendor/requirejs/require'],
        'vendor/angular/angular': ['vendor/jquery/jquery','vendor/ng-file-upload-shim/angular-file-upload-shim'],
        'vendor/bootstrap/bootstrap': ['vendor/jquery/jquery'],        
        'vendor/highcharts/highcharts': ['vendor/jquery/jquery'],
        'vendor/angular-local-storage/angular-local-storage': ['vendor/angular/angular'],
        'vendor/angular-ui-router/angular-ui-router': ['vendor/angular/angular'],
        'vendor/angular-animate/angular-animate': ['vendor/angular/angular'],
        'vendor/angular-strap/angular-strap': ['vendor/angular/angular','vendor/bootstrap/bootstrap'],
        'vendor/angular-strap/angular-strap.tpl': ['vendor/angular-strap/angular-strap'],
        'angular-simple-calendar/angular-simple-calendar':['vendor/angular/angular'],
        'vendor/angular/angular-momentjs': ['vendor/moment/moment'],
        'engine/engApp/init': [
          'vendor/angular/angular',
          'vendor/angular-momentjs/angular-momentjs',
          'vendor/bootstrap/bootstrap',
          'vendor/highcharts/highcharts',
          'vendor/angular-local-storage/angular-local-storage',
          'vendor/angular-ui-router/angular-ui-router',
          'vendor/angular-animate/angular-animate',
          'vendor/ng-file-upload/angular-file-upload',
          'vendor/angular-strap/angular-strap',
          'vendor/angular-strap/angular-strap.tpl',
          'vendor/ng-sortable/ng-sortable'
        ],
        'ngTemplateCache': [appName+'/init']
      };
      this._shim[appInit] = [
        'vendor/angular/angular',
        'vendor/bootstrap/bootstrap',
        'vendor/highcharts/highcharts',
        'vendor/angular-local-storage/angular-local-storage',
        'vendor/angular-ui-router/angular-ui-router',
        'vendor/angular-animate/angular-animate',
        'vendor/angular-strap/angular-strap',
        'angular-simple-calendar/angular-simple-calendar',
        'engine/engApp/init'
      ];

      var allNgFiles = grunt.file.expand([
        appDir+'/**/components/**/*.js',
        appDir+'/**/constants/**/*.js',
        appDir+'/**/filters/**/*.js',
        appDir+'/**/services/**/*.js',
        appDir+'/**/views/**/*.js'
      ]);

      for(var i=0; i<allNgFiles.length; i++) {
          this._shim[this._getHandle(allNgFiles[i])] = [appName+'/init','engine/engApp/init'];
      }
    },
    writeFile: function() {
      //stole this pattern from the shimmer library - allows us to specify 
      //all of our info in the requirejs config file so that our config can 
      //be accurate as of the task execution (specifically file.expand resolution)
      var out = 
        '(function()\n' +
        '  {require({\n' + 
        '    include: '+JSON.stringify(this._paths).replace(/,/g,',\n')+',\n'+
        '    paths:'+JSON.stringify(this._pathMap).replace(/,/g,',\n')+',\n' +
        '    shim:'+JSON.stringify(this._shim).replace(/,/g,',\n')+'\n' +
        '  });\n' +
        '}).call(this);';
      grunt.file.write(path.resolve(__dirname,'require.main.js'),out);
    }
  };

  //grunt task config
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        options: {
          //verbose: true,
          targetDir: vendorDir,
          layout: 'byType',
          install: false
        }
      }
    },    
    clean: {
      build: 'dist',
      buildArtifacts: [vendorDir,tmpDir,appDir+'/ngTemplateCache.js','require.main.js',appDir+'/signUpTemplateCache.js','require.signup.js'],
      debugHelpers: 'dist/web'
    },
    copy: {
      rules: {
        files: [{
          expand: true,
          cwd: 'web',
          src: 'rules/**',
          dest: 'dist'
        }]
      },
      bundles: {
        files: [{
          expand: true,
          cwd: 'web',
          src: 'bundles/**',
          dest: 'dist'
        }]
      },      
      indexFiles: {
        files: [{
          expand: true,
          src: matchers.indexFiles,
          flatten: true,
          dest: 'dist'
        }]
      },
      bootstrapFonts: {
        files: [{
          expand: true,
          cwd: 'web/app/vendor/bootstrap',
          src: ['glyphicons-halflings-regular.eot' ,'glyphicons-halflings-regular.svg' ,'glyphicons-halflings-regular.ttf', 'glyphicons-halflings-regular.woff'],
          dest: 'dist/fonts'
        }]
      },
      appFonts: {
        files: [{
                  expand: true,
                  cwd: 'web/fonts',
                  src: '**',
                  dest: 'dist/fonts'
                }]
      },
      lessSrc: {
        files: [{
          expand: true,
          cwd: 'web',
          src: 'less/**',
          dest: 'dist/web'
        }]
      },
      fileFlash: {
        files: [{
          expand: true,
          cwd: 'web/app/vendor',
          src: 'FileAPI/dist/**',
          dest: 'dist'
        }]
      },
      vendorCss: {
        files: [{
          expand: true,
          cwd: 'web',
          src: 'css/**',
          dest: 'dist'
        }]        
      }
    },
    cssmin: {
      build: {
        files: {
          'dist/css/kernel.css': ['dist/css/kernel.css'],
          'dist/css/animate/animate.css': ['dist/css/animate/animate.css'],
          'dist/css/angular-motion/angular-motion.css': ['dist/css/angular-motion/angular-motion.css'],
          'dist/css/ng-sortable/ng-sortable.css': ['dist/css/ng-sortable/ng-sortable.css']
        }
      }
    },
    shell: {
      copyFilesWin: {
        command: function(direct) { if ( target != 'nope' ) { return 'xcopy /s /e /r /q /h /i /y dist ' + direct + '\\dist'; } else {return 'pwd';} }
      },
      pwdLin: {
        command: function(direct) { return 'pwd'; }
      },
      copyEngine: {
        command: function (direct) { if (target != 'nope') { return 'xcopy /s /e /r /q /h /i /y src\\Engine\\EngineBundle\\Resources\\public web\\app\\engine'; } else {return 'cp -rf src/Engine/EngineBundle/Resources/public/* web/app/engine'; } }
      }
    },
    imagemin: {
      build: {
         files: [{
          expand: true,          
          flatten: true,
          src: ['web/images/**.+('+imageExtenstions+')'],
          dest: 'dist/images'
        }]
      }
    },
    jshint: {
      files: [ appDir+'/**/*.js' , '!'+vendorDir+'/**' ],
      options: {
        sub: true,
        laxcomma: true,
        laxbreak: true,
        loopfunc: true,
        lastsemic:true
      }
    },
    less: {
      build: {
        options: {
          paths: ['web/less'],
          //cleancss: true,
          compress: true,
          sourceMap: true,
          sourceMapFilename: 'dist/css/kernel.css.map',
          sourceMapURL: '/css/kernel.css.map'
        },
        files: {
          'dist/css/kernel.css': 'web/less/main.less',
          'dist/css/reports.css': 'web/less/reports.less'
        }
      }
    },
    ngtemplates: {
      build: {
        src: appDir+'/**/*.html',
        dest: appDir+'/ngTemplateCache.js',
        options: {
          module: appName.charAt(0).toUpperCase()+appName.slice(1)+'App',
          url: function(u) {
            return u.replace('web','');
          }
        }
      }
    },
    requirejs: {
      build: {
        options: {
          mainConfigFile: 'require.main.js',
          optimize: 'uglify2',
          out: 'dist/kernel.js',
          preserveLicenseComments: false,
          generateSourceMaps: false,
          ascii_only: true,
          uglify2: {
            mangle: false,
            ascii_only: true,
            output: {
                  ascii_only: true
            }
          }
        }
      },      
      dev: {
        options: {
          mainConfigFile: 'require.main.js',
          optimize: 'none',
          out: 'dist/kernel.js',
          preserveLicenseComments: false,
          generateSourceMaps: false
        }   
      },
    },
    watch: {
      less: {
        files: ['web/less/**'],
        tasks: ['less','copy:lessSrc','shell:copyFilesWin:' + target ]
      },
      jsApp: {
        files: [appDir+'/**/*.js','!'+vendorDir+'/**','!web/app/ngTemplateCache.js','!web/app/engine/**'],
        tasks: ['jshint','bower', 'ngtemplates:build', 'rjs:write', 'requirejs:dev','shell:copyFilesWin:' + target ]
      },
      jsSrc: {
        files: ['src/Engine/EngineBundle/Resources/public/**/*.js'],
        tasks: ['shell:copyEngine:'+target, 'jshint','bower', 'ngtemplates:build','rjs:write', 'requirejs:dev','shell:copyFilesWin:' + target ]
      },
      ngTemplatesSrc: {
        files: ['src/Engine/EngineBundle/Resources/public/**/*.html'],
        tasks: ['shell:copyEngine:'+target, 'bower', 'ngtemplates:build', 'rjs:write', 'requirejs:dev','shell:copyFilesWin:' + target ]
      },
      ngTemplates: {
        files: [appDir+'/**/*.html','!'+appDir+'/signup/**/*.html'],
        tasks: ['bower', 'ngtemplates:build', 'rjs:write', 'requirejs:dev','shell:copyFilesWin:' + target ]
      },
      indexFiles: {
        files: matchers.indexFiles,
        tasks: ['copy:indexFiles','shell:copyFilesWin:' + target ]
      },
      images: {
        files: ['web/images/**'],
        tasks: ['imagemin','shell:copyFilesWin:' + target ]
      },
      rules: {
        files: ['web/rules/**'],
        tasks: ['copy:rules','shell:copyFilesWin:' + target ]
      }
    },
    concurrent: {
      'imageminandrequire-dev':['imagemin','less','requirejs:dev'],
      'imageminandrequire-build':['imagemin','less','requirejs:build'],
      'jshintandbower':['jshint','bower']
    }
  });

  
  //custom task to update rjs file/paths indexes 
  //  - needed so that this can be computed at the task runtime instead of
  //    on config/load.  The only way to guarantee run-time accuracy is to
  //    write a main file that gets loaded in via grunt's require task instead
  //    of using the built in options which are analyzed at grunt config init
  grunt.registerTask('rjs:write', function() {
    rjs.generatePaths();
    rjs.generateShim(); 
    rjs.writeFile();
  });


  //load tasks dynamically
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  //register alias tasks
  /*
  grunt.registerTask('dev', ['clean:build','jshint', 'bower', 'copy', 'ngtemplates:build','ngtemplates:signup', 'imagemin', 'less', 'rjs:write', 'requirejs:dev','requirejs:devsignup', 'clean:buildArtifacts']);
  grunt.registerTask('dev:pre', ['clean:build','jshint', 'bower', 'copy', 'ngtemplates:build','ngtemplates:signup', 'imagemin', 'less', 'rjs:write']);
  grunt.registerTask('dev:app', ['clean:build','jshint', 'bower', 'copy', 'ngtemplates:build', 'imagemin', 'less', 'rjs:write', 'requirejs:dev', 'clean:buildArtifacts']);
  grunt.registerTask('dev:signup', ['clean:build','jshint', 'bower', 'copy','ngtemplates:signup', 'imagemin', 'less', 'rjs:write','requirejs:devsignup', 'clean:buildArtifacts']);
  */


  grunt.registerTask('dist', ['clean:build', 'jshint', 'bower', 'copy', 'ngtemplates:build', 'imagemin', 'less', 'cssmin', 'rjs:write', 'requirejs:build', 'clean:buildArtifacts', 'clean:debugHelpers']);
  grunt.registerTask('dev',['clean:build','shell:copyEngine:' + target, 'jshint','bower', 'copy', 'ngtemplates:build','rjs:write','concurrent:imageminandrequire-dev','shell:copyFilesWin:' + target ]);
  grunt.registerTask('devSync',['clean:build','shell:copyEngine:' + target, 'jshint','bower', 'copy', 'ngtemplates:build','rjs:write','imagemin','less','requirejs:dev','shell:copyFilesWin:' + target ]);
  //grunt.registerTask('devWin1',['clean:build','shell:copyEngine:' + target, 'jshint','bower', 'copy', 'ngtemplates:build','rjs:write','imagemin','requirejs:dev','shell:copyFilesWin:' + target ]);

};
