import matplotlib.pyplot as plt
import seaborn as sns

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
    numeric_df = df.select_dtypes(include=['number'])
    if not numeric_df.empty and numeric_df.shape[1] > 0:
        sns.boxplot(data=numeric_df, ax=ax)
        ax.set_title('Box Plot')

def create_pair_plot(df, ax):
    numeric_df = df.select_dtypes(include=(['number']))
    if not numeric_df.empty and numeric_df.shape[1] > 1:
        sns.pairplot(numeric_df)
        ax.set_title('Pair Plot')

visualizations = {
    'curve_plot': create_curve_plot,
    'histogram': create_histogram,
    'box_plot': create_box_plot,
    'pair_plot': create_pair_plot
}