#!/bin/bash
cd $1
cd javaclient && mvn exec:exec
