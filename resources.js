$(document).ready(function () {

  var library = [
    {
      "topic": "Computer Science Theory",
      "courses": [
        { "title": "Logic In Computer Science", "author": "Huth & Ryan", "source": "LogicInComputerScience_Huth&Ryan.pdf" },
        { "title": "Automata & Computability", "author": "Dexter C. Kozen", "source": "DexterKozen.pdf" },
        { "title": "Introduction to Automata Theory", "author": "Hopcraft, Motwani & Ullman", "source": "HopcroftMotwaniUllman2ndEdition.pdf" }
      ]
    },
    {
      "topic": "Programming",
      "courses": [
        { "title": "Data Structures & Algorithms", "author": "T.H Cormen", "source": "DataStructures&Algorithms_Cormen.pdf" },
        { "title": "Algorithm Design", "author": "Tardos", "source": "AlgorithmDesign_ EvaTardos.pdf" }
      ]
    },
    {
      "topic": "Networks & Security",
      "courses": [
        { "title": "Computer Networks: A Systems Approach", "author": "", "source": "ComputerNetworksSystemsApproach.pdf" }
      ]
    },
    {
      "topic": "Computer Vision",
      "courses": [
        { "title": "Digital Image Processing", "author": "Gonzalez & Woods", "source": "DigitalImageProcessing_Gonzalez&Woods.pdf" }
      ]
    },
    {
      "topic": "Databases",
      "courses": [
        { "title": "Databases & Information Systems", "author": "Sudarshan", "source": "Databases&InformationSystems.pdf" }
      ]
    },
    {
      "topic": "Operating Systems",
      "courses": [
        { "title": "Operating System Concepts", "author": "", "source": "OperatingSystemConcepts.pdf" }
      ]
    },
    {
      "topic": "Artificial Intelligence",
      "courses": [
        { "title": "Artificial Intelligence: A Modern Approach", "author": "", "source": "AIMA.pdf" },
        { "title": "Reinforcement Learning", "author": "Sutton & Barto", "source": "Sutton&Barto.pdf" }
      ]
    },
    {
      "topic": "Machine Learning & Statistics",
      "courses": [
        { "title": "Intro to ML", "author": "Kai-Wei Chang", "source": "IntroToML-compressed.pdf" },
        { "title": "Understanding ML: From Theory to Algorithms", "author": "Shwartz & David", "source": "UnderstandingML_Shwartz.pdf" },
        { "title": "Pattern Classification", "author": "Duda", "source": "PatternClassification_Duda.pdf" }
      ]
    },
    {
      "topic": "Computer Architecture",
      "courses": [
        { "title": "Digital Logic Design", "author": "Morris Mano", "source": "DigitalDesign_MorrisMano.pdf" },
        { "title": "Computer Organisation & Design", "author": "", "source": "ComputerOrganisation&Design.pdf" }
      ]
    },
    {
      "topic": "Compilers",
      "courses": [
        { "title": "Compilers: Principles, Techniques & Tools", "author": "Ullman", "source": "ALSUdragonbook.pdf" }
      ]
    }
  ];

  var html = '<div class="library-grid">';
  for (var i = 0; i < library.length; i++) {
    var item = library[i];
    var links = '';
    for (var j = 0; j < item.courses.length; j++) {
      var c = item.courses[j];
      links += '<a href="./static/pdfs/' + c.source + '" target="_blank" rel="noopener">' + c.title + '</a>';
    }
    html += '<div class="library-topic"><h4>' + item.topic + '</h4>' + links + '</div>';
  }
  html += '</div>';

  $('#miniLibrary').html(html);
});
