import pandas as pd
import numpy as np
import math
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score, GridSearchCV, cross_validate, train_test_split
from sklearn.preprocessing import StandardScaler, normalize
from sklearn import metrics

def main():
    data_per_nbhd, label_per_nbhd = prepare_data()

    #neighborhood 'FLATLANDS',
    train(data_per_nbhd[61], label_per_nbhd[61])
    pass

def prepare_data():
    nbhd = pd.read_csv('neighborhood.csv', header=0)
    bd_cat = pd.read_csv('buiding_category.csv', header=0)
    data_raw = pd.read_csv('housing_price_training.csv', header=0)

    # Convert price per unit
    # data_raw['price'] = np.where(data_raw['tot_unit']>0, data_raw['price']/data_raw['tot_unit'], data_raw['price'])

    # Convert price per square foot
    data_raw['price'] = data_raw['price']/data_raw['tot_sqft']
    # Removing outliers 
    p90 = np.percentile(data_raw['price'], 90)
    p10 = np.percentile(data_raw['price'], 10)
    data_raw = data_raw[data_raw['price'] < p90]
    data_raw = data_raw[data_raw['price'] > p10]

    # Convert tot_sqft per unit
    data_raw['tot_sqft'] = np.where(data_raw['tot_unit']>0, data_raw['tot_sqft']/data_raw['tot_unit'], data_raw['tot_sqft'])
    p90 = np.percentile(data_raw['tot_sqft'], 90)
    data_raw = data_raw[data_raw['tot_sqft'] < p90]


    #Convert long and lat to distance to central park 
    # for i, row in data_raw.iterrows():
    #     lon = row['long']
    #     lat = row['lat']
    #     cp_diss = getdistance(lat, lon)
    #     data_raw.at[i,'cp_diss'] = cp_diss
    # data_raw = data_raw.drop(['long', 'lat'], axis=1)

    #For linear regression, one hot coding 
    # for i, row in bd_cat.iterrows():
    #     bc_id = row['id']
    #     data_raw['bc'+ str(bc_id)] = np.where(data_raw['bldg_ctgy_id'] == bc_id, 1, 0)

    # for i in range(1,5):
    #     data_raw['tc'+ str(i)] = np.where(data_raw['tax_cls_s'] == i, 1, 0)

    # data_raw = data_raw.drop(['bldg_ctgy_id', 'tax_cls_s'], axis=1)


    #Plot raw data
    data_raw.hist(bins=50, figsize=(20,15))
    plt.show()

    train_data = data_raw.loc[:, data_raw.columns != "price"]
    label_data = data_raw.loc[:, "price"]

    data_per_nbhd = {}
    label_per_nbhd = {}

    #Prepare data for each neighborhood
    for i, row in nbhd.iterrows():
        nbhd_id = row['id']
        nbhd_name = row['name']
        
        data = data_raw[data_raw['nbhd_id']==nbhd_id]

        data = data.drop(['nbhd_id'], axis=1)

        train_data = data.loc[:, data.columns != "price"]
        
        # For linear regretion, higher dimension
        # for column in train_data.columns:
        #     train_data[column+'2'] = train_data[column] * train_data[column]
        #     train_data[column+'3'] = train_data[column] * train_data[column] * train_data[column]

        data_per_nbhd[nbhd_id] = train_data
        label_per_nbhd[nbhd_id] = data.loc[:, "price"]

    return data_per_nbhd, label_per_nbhd
    #You can return whole data set as one trainning set
    # return train_data, label_data


def train(x_data, y_data):
    x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, test_size=0.2, random_state=100, shuffle=True)

    # standard scale for linear regression and MLP regression
    # scaler = StandardScaler()
    # scaler.fit(x_train)
    # x_train_sca = scaler.transform(x_train)
    # x_test_sca = scaler.transform(x_test)

    x_train_sca = x_train
    x_test_sca = x_test

    # regr = LinearRegression()
    # print (regr.intercept_)
    # print (regr.coef_)


    # regr = MLPRegressor(solver='lbfgs', hidden_layer_sizes=(520, 5), random_state=1)

    regr = RandomForestRegressor(max_depth=20, random_state=100, n_estimators=200, n_jobs=-1)

    regr.fit(x_train_sca, y_train)
    

    tr_predicted = regr.predict(x_train_sca)
    regr_ac_tr = mean_absolute_percentage_error(y_train, tr_predicted)

    test_predicted = regr.predict(x_test_sca)
    regr_ac_te = mean_absolute_percentage_error(y_test, test_predicted)
    print('++++++++++++++++++++++++++++++++++++++++++++')
    print('Training set Root Mean Squared Error: {}'.format(regr_ac_tr))
    print('Testing set Root Mean Squared Error: {}'.format(regr_ac_te))

    #For random forest, feature importance
    feature_importance = regr.feature_importances_
    #-feature_importance to have descending order
    sorted_fi_index = np.argsort(-feature_importance)
    most_to_least_important_fetaure = x_data.columns[sorted_fi_index].tolist()
    print('Most to least important fetaure: {}'.format(most_to_least_important_fetaure))

    fig, ax = plt.subplots()
    ax.scatter(y_test, test_predicted)
    ax.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=4)
    ax.set_xlabel('Measured price per square foot')
    ax.set_ylabel('Predicted price per square foot')
    plt.show()

def mean_absolute_percentage_error(y_true, y_pred): 
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

def getdistance(lat1, lon1):
    R = 6372800  # Earth radius in meters

    #Central park location
    lon2 = -73.96157881970851
    lat2 = 40.78051448029149
    
    phi1, phi2 = math.radians(lat1), math.radians(lat2) 
    dphi       = math.radians(lat2 - lat1)
    dlambda    = math.radians(lon2 - lon1)
    
    a = math.sin(dphi/2)**2 + \
        math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    
    return 2*R*math.atan2(math.sqrt(a), math.sqrt(1 - a))

if __name__ == "__main__":
    main()