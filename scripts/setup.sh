
# install packages for root dir
yarn

# install packages for sdk dir
cd sdk && yarn && cd ..

# install packages for test dir
cd tests && yarn && cd ..

# build program
yarn build