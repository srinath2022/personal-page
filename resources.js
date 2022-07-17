
$(document).ready(function() {
  
  var library = [
                  {
                    "topic": "Computer Science Theory",
                    "courses": [{
                        "title" : "Logic In Computer Science",
                        "author": "Huth & Ryan",
                        "source": "LogicInComputerScience_Huth&Ryan.pdf"
                      },
                      {
                        "title" : "Automata & Computability",
                        "author": "Dexter C. Kozen",
                        "source": "DexterKozen.pdf"
                      },
                      {
                        "title" : "Introduction to Automata Theory",
                        "author": "Hopcraft, Motwani & Ullman",
                        "source": "HopcroftMotwaniUllman2ndEdition.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Programming",
                    "courses": [{
                        "title" : "Data Structures & Algorithms",
                        "author": "T.H Cormen",
                        "source": "DataStructures&Algorithms_Cormen.pdf"
                      },
                      {
                        "title" : "Algorithm Design",
                        "author": "Tardos",
                        "source": "AlgorithmDesign_ EvaTardos.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Networks & Security",
                    "courses": [{
                        "title" : "Computer Networks A System Approach",
                        "author": "",
                        "source": "ComputerNetworksSystemsApproach.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Computer Vision",
                    "courses": [{
                        "title" : "Digital Image Processing",
                        "author": "Gonzalez & Woods",
                        "source": "DigitalImageProcessing_Gonzalez&Woods.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Databases",
                    "courses": [{
                        "title" : "Databases & Information Systems",
                        "author": "Sudarshan",
                        "source": "Databases&InformationSystems.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Operating Systems",
                    "courses": [{
                        "title" : "Operating System Concepts",
                        "author": "",
                        "source": "OperatingSystemConcepts.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Artificial Intelligence",
                    "courses": [{
                        "title" : "Artificial Intelligence A Modern Approach",
                        "author": "",
                        "source": "AIMA.pdf"
                      },
                      {
                        "title" : "Foundations of Intelligent and Learning Agents",
                        "author": "Sutton Barto",
                        "source": "Sutton&Barto.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Machine Learning & Statistics",
                    "courses": [{
                        "title" : "Intro to ML",
                        "author": "Kai-Wei-Chang",
                        "source": "IntroToML-compressed.pdf"
                      },
                      {
                        "title" : "Understanding ML, From Theory to Algorithms",
                        "author": "Shwartz, David",
                        "source": "UnderstandingML_Shwartz.pdf"
                      },
                      {
                        "title" : "Pattern Classification",
                        "author": "Duda",
                        "source": "PatternClassification_Duda.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Computer Architecture",
                    "courses": [{
                        "title" : "Digital Logic Design",
                        "author": "Morris Mano",
                        "source": "DigitalDesign_MorrisMano.pdf"
                      },
                      {
                        "title" : "Computer Organisation & Design",
                        "author": "",
                        "source": "ComputerOrganisation&Design.pdf"
                      }
                    ]
                  },

                  {
                    "topic": "Compilers",
                    "courses": [{
                        "title" : "Dragonbook-Compilers",
                        "author": "Ullman",
                        "source": "ALSUdragonbook.pdf"
                      }
                    ]
                  }
                  
                ];

  var N=library.length;

  left_column_html = "";
  var i=0;
  for(; i< N/2; i++){
    var item = library[i];
    var courses = item['courses'];
    courses_html = "";

    var j=0;
    for(; j<courses.length; j++){
        courses_html = courses_html + '<a href="./static/pdfs/'+courses[j]['source']+'">'+courses[j]['title']+'</a><br>';
    }

    left_column_html = left_column_html + '<div class="w3-container left-topic">'
                                            + '<h4><b>'+item['topic']+'</b></h4>'
                                            + '<div class="content">'
                                            +     courses_html
                                            + '</div>'
                                            + '<hr>'
                                        + '</div>';
  }

  right_column_html = "";
  for(; i< N; i++){
    var item = library[i];
    var courses = item['courses'];
    courses_html = "";

    var j=0;
    for(; j<courses.length; j++){
        courses_html = courses_html + '<a href="./static/pdfs/'+courses[j]['source']+'">'+courses[j]['title']+'</a><br>';
    }

    right_column_html = right_column_html + '<div class="w3-container right-topic">'
                                              + '<h4><b>'+item['topic']+'</b></h4>'
                                              + '<div class="content">'
                                              +     courses_html
                                              + '</div>'
                                              + '<hr>'
                                          + '</div>';
  }

  library_html = "";
  library_html = library_html + '<div class="row">'
                              +   '<div class="column">'
                              +     left_column_html
                              +   '</div>'
                              +   '<div class="column">'
                              +     right_column_html
                              +   '</div>'
                              + '</div>';

  //append the markup to the DOM
  $("#miniLibrary").html(library_html);
});