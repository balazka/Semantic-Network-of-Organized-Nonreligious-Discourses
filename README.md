# Semantic Network of Organized Non-Religious Discourses

**This page is currently work in progress**

The interactive tool is available [here](https://balazka.github.io/Semantic-Network-of-Organized-Nonreligious-Discourses/#). The tool does not support mobile devides.

## 1. Theoretical background



<br>

## 2. More about this visualization
This interactive visualization is based on a collection of 7308 issues of British and American non-religious magazines published between 1881 and 2019. Two long-running magazines, one more radical (i.e., that self-identify with atheism) and one more moderate (i.e., that self-identify with humanism), with ties to a militant non-religious organization were selected for each considered country. The corpus includes The Freethinker (UK), New Humanist (UK), American Atheist (US), and The Humanist (US). The data are presented here in an aggregate form.

The magazines were split into sentences using spaCy to obtain smaller and more homogeneous units of analysis. The final corpus consists of 7,046,679 sentences. The documents were processed in stages. First, four multi-word tokens (i.e, "the_humanist", "new_humanist", "the_freethinker", and "american_atheist") were defined leveraging capitalization rules to distinguish the names of the magazines from other instances using the same verbal units. Afterwards, the text was lowercased and stripped while numbers and punctuation were removed. An exception was made whenever a hyphen appeared between two words to preserve meaningful tokens such as "non-belief" or "anti-abortion". Additional multi-word tokens, like "united_kingdom" or "age_of_reason", were then defined observing recurrent bi-grams. The resulting sentences were then tokenized. All the tokens were translated from British English to American English and then lemmatized filtering out stopwords and terms with 2 characters or less. The final list of tokens was passed through a dictionary to identify typos and other recurrent errors in the text. All unrecognized terms with a frequency of 10 or higher were manually controlled and corrected when necessary.

LDA
Louvain method (Blondel et al., 2008)
circle pack algorithm (Bostock, 2018)
Network (Drieger, 2013)

The visualization is hierarchical. The nodes are first clustered on the base of their primary topic, as identified by LDA, then clustered on the base of their modularity, and finally grouped by their eigenvector centrality. To simplify the visualization making it more readable, only the tokens with a frequency of 100 or higher are represented in the netwrok. While all the represented nodes have a list of their top 10 connections in the information pane, a connection is represented in the visualization only if the two terms appeared in the same sentence at least 400 times.

## 3. Changelog
This section will cover the differences between the versions uploaded to Zenodo.

## 4. References
* Balazka, D. (2020). _Mapping Religious Nones in 112 Countries: An Overview of European Values Study and World Values Survey Data (1981-2020)_. Technical report, Prot. 8 / 07-2020, Fondazione Bruno Kessler.
* Balazka, D., Houtman, D., & Lepri, B. (2021). How Can Big Data Shape the Field of Non-Religion Studies? And Why Does It Matter? _Patterns_ 2(6): 1-12. DOI: 10.1016/j.patter.2021.100263
* Blondel, V. D., Guillaume, J. L., Lambiotte, R., Lefebvre, E. (2008). Fast Unfolding of Communities in Large Networks. _Journal of Statistical Mechanics: Theory and Experiment_ 2008(10): 1-12. DOI: 10.1088/1742-5468/2008/10/P10008
* Bostock, M. (2018). Zoomable Circle Packing. _Dosegljivo: https://bl.ocks.org/mbostock/7607535_.
* Drieger, P. (2013). Semantic Network Analysis as a Method for Visual Text Analytics. _Procedia - Social and Behavioral Sciences_ 79: 4-17. DOI: 10.1016/j.sbspro.2013.05.053
