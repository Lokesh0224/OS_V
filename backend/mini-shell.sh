#!/bin/bash
# ----------------------------------------
# Mini Shell Command Interpreter Project
# ----------------------------------------

GREEN="\033[1;32m"
CYAN="\033[1;36m"
RESET="\033[0m"

# Infinite loop for the shell logic
while true
do
    # Read user input
    read -r input

    if [[ -z "$input" ]]; then
        continue
    fi

    if [[ "$input" == "exit" ]]; then
        echo -e "${CYAN}Exiting Mini Shell... Goodbye!${RESET}"
        exit 0
    fi

    if [[ "$input" == cd* ]]; then
        dir=${input:3}
        if [[ -z "$dir" ]]; then
            cd ~
        else
            cd "$dir" 2>/dev/null || echo "Directory not found: $dir"
        fi
        continue
    fi

    eval "$input" 2>&1
done
