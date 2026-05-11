#!/bin/bash
MVN="/Users/hee/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3/bin/mvn"
"$MVN" spring-boot:run -f "$(dirname "$0")/pom.xml"
