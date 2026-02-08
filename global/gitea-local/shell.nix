let
  pkgs = import <nixpkgs> {};
  gitea = pkgs.gitea;
in 
pkgs.mkShell {
    # Make gitea and git available in the shell 
    packages = [ gitea pkgs.git ];

    # Set environment variables for Gitea's working directory
    # This keeps data local to your project folder
    APP_NAME = "Gitea Local Instance";
    RUN_USER = builtins.getEnv "USER";
    WORK_PATH = "./data";
    # Define paths in  the local directory
    GITEA_CUSTOM = "/Users/LenMiller/projects/global/gitea-local/custom";
    GITEA_APP_DATA_PATH = "/Users/LenMiller/projects/global/gitea-local/data";
    GITEA_LOG_ROOT_PATH = "/Users/LenMiller/projects/global/gitea-local/log";
}
