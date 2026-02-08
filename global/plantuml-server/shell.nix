{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Java runtime for PlantUML server
    jdk17

    # Jetty runner to serve WAR files
    jetty_11

    # PlantUML server WAR file
    plantuml-server

    # PlantUML CLI tool (optional, for local rendering)
    plantuml

    # Diagram rendering dependencies
    graphviz

    # Utilities for testing
    curl

    # JSON manipulation for IDE configuration
    jq
  ];

  shellHook = ''
    export PLANTUML_SERVER_WAR="${pkgs.plantuml-server}/webapps/plantuml.war"
    export JETTY_HOME="${pkgs.jetty_11}"
    export PLANTUML_PORT=8765
    export PROJECT_ROOT="$(pwd)"

    # Add bin/ to PATH for helper scripts
    export PATH="$PROJECT_ROOT/bin:$PATH"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "PlantUML Server Development Environment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Java:    $(java -version 2>&1 | head -1)"
    echo "PlantUML Server: ${pkgs.plantuml-server.version}"
    echo "Port:    $PLANTUML_PORT"
    echo ""
    echo "Quick Start:"
    echo "  start      Start the server"
    echo "  stop       Stop the server"
    echo "  status     Check server status"
    echo "  restart    Restart the server"
    echo ""
    echo "Server will be available at:"
    echo "  http://localhost:$PLANTUML_PORT/plantuml"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  '';
}
