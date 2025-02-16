import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

def create_statistical_measures_plot(df, ax):
    numeric_df = df.select_dtypes(include=['number'])
    if not numeric_df.empty:
        stats = numeric_df.describe().T
        stats['median'] = numeric_df.median()  
        stats = stats.drop(columns=['count'])
        stats['mean'] = stats['mean'].round(3)
        stats['std'] = stats['std'].round(3)
        stats_table = ax.table(cellText=stats.values,
                               colLabels=stats.columns,
                               rowLabels=stats.index,
                               cellLoc='center',
                               loc='center')
        stats_table.auto_set_font_size(False)
        stats_table.set_fontsize(10)
        stats_table.scale(0.9, 0.9)  # Adjust the scale of the table 
        ax.axis('off')
        ax.set_title('Statistical Measures')

def create_curve_plot(df, ax):
    numeric_df = df.select_dtypes(include=['number'])
    if not numeric_df.empty and numeric_df.shape[1] > 0:
        ax.plot(numeric_df.index, numeric_df[numeric_df.columns[0]], label=numeric_df.columns[0])
        ax.legend()
        ax.set_title('Curve Plot')

def create_histogram(df, ax):
    numeric_df = df.select_dtypes(include=['number'])
    if not numeric_df.empty and numeric_df.shape[1] > 0:
        sns.histplot(numeric_df[numeric_df.columns[0]], ax=ax)
        ax.set_title('Histogram')

def create_box_plot(df, ax):
    numeric_df = df.select_dtypes(include=(['number']))
    if not numeric_df.empty and numeric_df.shape[1] > 0:
        sns.boxplot(data=numeric_df, ax=ax)
        ax.set_title('Box Plot')

def create_pair_plot(df, ax):
    numeric_df = df.select_dtypes(include=(['number']))
    if not numeric_df.empty and numeric_df.shape[1] > 1:
        sns.pairplot(numeric_df)
        ax.set_title('Pair Plot')

visualizations = {
    'statistical_measures': create_statistical_measures_plot,
    'curve_plot': create_curve_plot,
    'histogram': create_histogram,
    'box_plot': create_box_plot,
    'pair_plot': create_pair_plot
}